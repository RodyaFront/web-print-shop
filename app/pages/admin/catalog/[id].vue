<script setup lang="ts">
import {
  FIGURINE_STATUSES,
  FIGURINE_STATUS_LABELS,
  type FigurineProduct,
  type FigurineStatus,
} from '../../../../shared/figurky-catalog'
import {
  TURNTABLE_TARGET_FRAMES,
  TURNTABLE_TARGET_STEP_DEG,
  formatTurntableYaw,
  rotateTurntableToFront,
  turntableCenterIndex,
  turntableYawDegrees,
} from '../../../../shared/turntable-scrub'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const route = useRoute()
const idParam = computed(() => String(route.params.id))
const isNew = computed(() => idParam.value === 'new')

const title = ref('')
const slug = ref('')
const aliasesText = ref('')
const franchise = ref('')
const heightCm = ref(20)
const scale = ref('')
const priceUah = ref(5000)
const status = ref<FigurineStatus>('in_stock')
const published = ref(false)
const imageAlt = ref('')
const seoTitle = ref('')
const seoDescription = ref('')
const description = ref('')
const image = ref('')
const previewFrames = ref<string[]>([])

const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const deleteOpen = ref(false)
const deleting = ref(false)
const productId = ref('')

type DraftFrame = {
  key: string
  file: File
  url: string
  name: string
}

type DraftDragPayload =
  | { source: 'pool'; key: string }
  | { source: 'slot'; index: number }

const draftPool = ref<DraftFrame[]>([])
const draftSlots = ref<(DraftFrame | null)[]>(
  Array.from({ length: TURNTABLE_TARGET_FRAMES }, () => null),
)
const selectedSlot = ref(turntableCenterIndex(TURNTABLE_TARGET_FRAMES))
const dragOverSlot = ref<number | null>(null)
const previewOpen = ref(false)
const previewIndex = ref(0)
const previewImages = ref<string[]>([])

const draftCenter = turntableCenterIndex(TURNTABLE_TARGET_FRAMES)

const filledSlotCount = computed(
  () => draftSlots.value.filter(Boolean).length,
)

const draftOrderedFrames = computed(() => {
  const frames: DraftFrame[] = []
  for (const slot of draftSlots.value) {
    if (!slot) return []
    frames.push(slot)
  }
  return frames
})

const draftReady = computed(
  () => draftOrderedFrames.value.length === TURNTABLE_TARGET_FRAMES,
)

/** Pool or any placed slot - preview must show constructor, not saved catalog frames. */
const isDraftSession = computed(
  () => draftPool.value.length > 0 || filledSlotCount.value > 0,
)

const draftUrls = computed(() =>
  draftSlots.value.filter(Boolean).map((frame) => frame!.url),
)

/** Empty slot stand-in so partial assemblies still scrub as a 25-frame ring. */
const DRAFT_EMPTY_FRAME =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><rect width="640" height="640" fill="#e6ebf0"/><rect x="96" y="96" width="448" height="448" fill="none" stroke="#c2ccd6" stroke-width="4" stroke-dasharray="14 10" rx="12"/></svg>`,
  )

const draftScrubFrames = computed(() => {
  if (!isDraftSession.value) return null
  const urls = draftSlots.value.map((slot) => slot?.url ?? DRAFT_EMPTY_FRAME)
  // Same contract as server: last frame closes the ring with the first.
  return [...urls.slice(0, -1), urls[0]!]
})

const draftScrubMeta = computed(() => {
  if (!draftScrubFrames.value) return null
  return Array.from({ length: TURNTABLE_TARGET_FRAMES }, (_, index) => {
    const yaw = formatTurntableYaw(
      turntableYawDegrees(index, TURNTABLE_TARGET_FRAMES),
    )
    const sourceIndex = index === TURNTABLE_TARGET_FRAMES - 1 ? 0 : index
    const frame = draftSlots.value[sourceIndex]
    const role = draftRoleLabel(index)
    const parts = [
      `${index + 1}/${TURNTABLE_TARGET_FRAMES}`,
      yaw,
    ]
    if (role) parts.push(role)
    if (!frame) parts.push('порожньо')
    else parts.push(frame.name)
    return parts.join(' · ')
  })
})

const draftStripSlots = computed(() =>
  Array.from({ length: TURNTABLE_TARGET_FRAMES }, (_, index) => {
    const frame = draftSlots.value[index] ?? null
    const yaw = turntableYawDegrees(index, TURNTABLE_TARGET_FRAMES)
    return {
      index,
      frame,
      yawLabel: formatTurntableYaw(yaw),
      isBack: index === 0,
      isFront: index === draftCenter,
      isTail: index === TURNTABLE_TARGET_FRAMES - 1,
      isEmpty: !frame,
      role: draftRoleLabel(index),
    }
  }),
)

const draftCountLabel = computed(() => {
  const placed = filledSlotCount.value
  const pool = draftPool.value.length
  return `Слоти: ${placed} / ${TURNTABLE_TARGET_FRAMES} (крок ${TURNTABLE_TARGET_STEP_DEG}°). У списку: ${pool}. 0° = анфас, ±180° = спина.`
})

const draftHint = computed(() => {
  if (!draftPool.value.length && filledSlotCount.value === 0) {
    return 'Додайте фото - вони з’являться в списку. Потім перетягніть кожне на потрібний градус.'
  }
  if (draftPool.value.length) {
    return 'Перетягніть фото зі списку на слот із градусом.'
  }
  if (!draftReady.value) {
    return `Заповніть усі ${TURNTABLE_TARGET_FRAMES} слотів. Порожні ще: ${TURNTABLE_TARGET_FRAMES - filledSlotCount.value}.`
  }
  return 'Перевірте scrub. Якщо анфас не на 0°, оберіть його слот і натисніть «Це анфас».'
})

async function loadExisting() {
  if (isNew.value) return
  const product = await $fetch<FigurineProduct>(
    `/api/admin/figurky/${idParam.value}`,
  )
  productId.value = product.id
  title.value = product.title
  slug.value = product.slug
  aliasesText.value = product.aliases.join(', ')
  franchise.value = product.franchise || ''
  heightCm.value = product.heightCm
  scale.value = product.scale || ''
  priceUah.value = product.priceUah
  status.value = product.status
  published.value = product.published
  imageAlt.value = product.imageAlt
  seoTitle.value = product.seoTitle
  seoDescription.value = product.seoDescription
  description.value = product.description
  image.value = product.image
  previewFrames.value = product.previewFrames ? [...product.previewFrames] : []
}

try {
  await loadExisting()
} catch {
  throw createError({ statusCode: 404, statusMessage: 'Позицію не знайдено' })
}

useSeoMeta({
  title: () => (isNew.value ? 'Нова фігурка' : `Каталог: ${title.value || 'редагування'}`),
  robots: 'noindex, nofollow',
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onTitleBlur() {
  if (!slug.value && title.value) {
    slug.value = slugify(title.value)
  }
}

function payload() {
  return {
    title: title.value,
    slug: slug.value,
    aliases: aliasesText.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    franchise: franchise.value || undefined,
    heightCm: heightCm.value,
    scale: scale.value || null,
    priceUah: priceUah.value,
    status: status.value,
    published: published.value,
    imageAlt: imageAlt.value,
    seoTitle: seoTitle.value,
    seoDescription: seoDescription.value,
    description: description.value,
    image: image.value || undefined,
    previewFrames: previewFrames.value.length ? previewFrames.value : undefined,
  }
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    if (isNew.value) {
      const created = await $fetch<FigurineProduct>('/api/admin/figurky', {
        method: 'POST',
        body: payload(),
      })
      await navigateTo(`/admin/catalog/${created.id}`)
      return
    }
    const updated = await $fetch<FigurineProduct>(
      `/api/admin/figurky/${productId.value}`,
      {
        method: 'PATCH',
        body: payload(),
      },
    )
    image.value = updated.image
    previewFrames.value = updated.previewFrames
      ? [...updated.previewFrames]
      : []
    published.value = updated.published
    clearNuxtData('figurky-catalog')
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message || '')
        : ''
    error.value = message || 'Не вдалося зберегти'
  } finally {
    saving.value = false
  }
}

function revokeFrame(frame: DraftFrame | null | undefined) {
  if (frame) URL.revokeObjectURL(frame.url)
}

function clearDraft() {
  for (const frame of draftPool.value) revokeFrame(frame)
  for (const frame of draftSlots.value) revokeFrame(frame)
  draftPool.value = []
  draftSlots.value = Array.from(
    { length: TURNTABLE_TARGET_FRAMES },
    () => null,
  )
  selectedSlot.value = draftCenter
  dragOverSlot.value = null
}

function addDraftFiles(files: FileList | null) {
  if (!files?.length) return
  error.value = ''
  const capacity =
    TURNTABLE_TARGET_FRAMES -
    filledSlotCount.value -
    draftPool.value.length
  if (capacity <= 0) {
    error.value = `Уже є ${TURNTABLE_TARGET_FRAMES} кадрів (слоти + список).`
    return
  }
  const incoming = Array.from(files)
  const accepted = incoming.slice(0, capacity)
  const skipped = incoming.length - accepted.length
  draftPool.value = [
    ...draftPool.value,
    ...accepted.map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    })),
  ]
  if (skipped) {
    error.value = `Ліміт ${TURNTABLE_TARGET_FRAMES} кадрів (слоти + список). Зайві пропущено: ${skipped}.`
  }
}

function draftRoleLabel(index: number) {
  if (index === 0) return 'Спина'
  if (index === draftCenter) return 'Анфас'
  if (index === TURNTABLE_TARGET_FRAMES - 1) return 'Спина'
  return ''
}

function takeFromPool(key: string): DraftFrame | null {
  const index = draftPool.value.findIndex((frame) => frame.key === key)
  if (index < 0) return null
  const next = [...draftPool.value]
  const [frame] = next.splice(index, 1)
  draftPool.value = next
  return frame ?? null
}

function returnToPool(frame: DraftFrame) {
  draftPool.value = [...draftPool.value, frame]
}

function placeFrameOnSlot(frame: DraftFrame, slotIndex: number) {
  const next = [...draftSlots.value]
  const previous = next[slotIndex]
  next[slotIndex] = frame
  draftSlots.value = next
  selectedSlot.value = slotIndex
  if (previous) returnToPool(previous)
}

function onPoolDragStart(key: string, event: DragEvent) {
  if (uploading.value) {
    event.preventDefault()
    return
  }
  const payload: DraftDragPayload = { source: 'pool', key }
  const raw = JSON.stringify(payload)
  event.dataTransfer?.setData('application/x-figurky-draft', raw)
  event.dataTransfer?.setData('text/plain', raw)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onSlotDragStart(index: number, event: DragEvent) {
  if (uploading.value || !draftSlots.value[index]) {
    event.preventDefault()
    return
  }
  const payload: DraftDragPayload = { source: 'slot', index }
  const raw = JSON.stringify(payload)
  event.dataTransfer?.setData('application/x-figurky-draft', raw)
  event.dataTransfer?.setData('text/plain', raw)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function readDragPayload(event: DragEvent): DraftDragPayload | null {
  const raw =
    event.dataTransfer?.getData('application/x-figurky-draft') ||
    event.dataTransfer?.getData('text/plain')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DraftDragPayload
    if (parsed?.source === 'pool' && typeof parsed.key === 'string') return parsed
    if (parsed?.source === 'slot' && typeof parsed.index === 'number') return parsed
    return null
  } catch {
    return null
  }
}

function onSlotDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dragOverSlot.value = index
}

function onSlotDragLeave(index: number) {
  if (dragOverSlot.value === index) dragOverSlot.value = null
}

function onSlotDrop(index: number, event: DragEvent) {
  event.preventDefault()
  dragOverSlot.value = null
  if (uploading.value) return

  const payload = readDragPayload(event)
  if (!payload) return

  if (payload.source === 'pool') {
    const frame = takeFromPool(payload.key)
    if (!frame) return
    placeFrameOnSlot(frame, index)
    return
  }

  if (payload.index === index) return
  const next = [...draftSlots.value]
  const moving = next[payload.index]
  if (!moving) return
  const swapped = next[index]
  next[index] = moving
  next[payload.index] = swapped ?? null
  draftSlots.value = next
  selectedSlot.value = index
}

function onPoolDrop(event: DragEvent) {
  if (uploading.value) return
  const payload = readDragPayload(event)
  if (!payload || payload.source !== 'slot') return
  unassignSlot(payload.index)
}

function unassignSlot(index: number) {
  const frame = draftSlots.value[index]
  if (!frame) return
  const next = [...draftSlots.value]
  next[index] = null
  draftSlots.value = next
  returnToPool(frame)
}

function removePoolFrame(key: string) {
  const index = draftPool.value.findIndex((frame) => frame.key === key)
  if (index < 0) return
  const next = [...draftPool.value]
  const [frame] = next.splice(index, 1)
  draftPool.value = next
  revokeFrame(frame)
}

function selectSlot(index: number) {
  if (selectedSlot.value === index && draftSlots.value[index]) {
    openSlotPreview(index)
    return
  }
  selectedSlot.value = index
}

function openSlotPreview(index: number) {
  const frame = draftSlots.value[index]
  if (!frame) return
  selectedSlot.value = index
  previewImages.value = draftUrls.value
  const at = previewImages.value.indexOf(frame.url)
  previewIndex.value = at >= 0 ? at : 0
  previewOpen.value = true
}

function openPoolPreview(key: string) {
  const urls = draftPool.value.map((item) => item.url)
  const at = draftPool.value.findIndex((item) => item.key === key)
  if (at < 0) return
  previewImages.value = urls
  previewIndex.value = at
  previewOpen.value = true
}

function makeSelectedFront() {
  if (!draftReady.value) return
  const from = selectedSlot.value
  if (from < 0 || from >= TURNTABLE_TARGET_FRAMES) return
  if (!draftSlots.value[from]) return
  draftSlots.value = rotateTurntableToFront(draftSlots.value, from)
  selectedSlot.value = draftCenter
}

async function uploadCover(files: FileList | null) {
  if (!files?.length || isNew.value || !productId.value) {
    error.value = isNew.value
      ? 'Спочатку збережіть позицію, потім завантажте фото'
      : 'Немає файлів'
    return
  }
  error.value = ''
  uploading.value = true
  try {
    const form = new FormData()
    form.set('kind', 'cover')
    form.append('files', files[0]!)
    const result = await $fetch<{ image?: string }>(
      `/api/admin/figurky/${productId.value}/media`,
      { method: 'POST', body: form },
    )
    if (result.image) image.value = result.image
    clearNuxtData('figurky-catalog')
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message || '')
        : ''
    error.value = message || 'Не вдалося завантажити обкладинку'
  } finally {
    uploading.value = false
  }
}

async function saveDraftFrames() {
  if (isNew.value || !productId.value) {
    error.value = 'Спочатку збережіть позицію, потім завантажте фото'
    return
  }
  if (!draftReady.value) {
    error.value = draftHint.value || 'Заповніть усі слоти градусів'
    return
  }
  error.value = ''
  uploading.value = true
  try {
    const form = new FormData()
    form.set('kind', 'turntable')
    for (const frame of draftOrderedFrames.value) {
      form.append('files', frame.file)
    }
    const result = await $fetch<{
      image?: string
      frames?: string[]
    }>(`/api/admin/figurky/${productId.value}/media`, {
      method: 'POST',
      body: form,
    })
    if (result.image) image.value = result.image
    if (result.frames) previewFrames.value = result.frames
    clearDraft()
    clearNuxtData('figurky-catalog')
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message || '')
        : ''
    error.value = message || 'Не вдалося зберегти кадри'
  } finally {
    uploading.value = false
  }
}

onBeforeUnmount(() => {
  clearDraft()
})

async function removeProduct() {
  if (!productId.value) return
  deleting.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/figurky/${productId.value}`, { method: 'DELETE' })
    clearNuxtData('figurky-catalog')
    await navigateTo('/admin/catalog')
  } catch {
    error.value = 'Не вдалося видалити'
    deleting.value = false
    deleteOpen.value = false
  }
}
</script>

<template>
  <div class="stack">
    <NuxtLink class="icon-gap" to="/admin/catalog">
      <Icon name="ph:caret-left" class="icon-sm" aria-hidden="true" />
      До каталогу
    </NuxtLink>

    <div class="row row-between row-end">
      <h1>{{ isNew ? 'Нова фігурка' : 'Редагування' }}</h1>
      <button
        v-if="!isNew"
        type="button"
        class="btn btn-ghost"
        @click="deleteOpen = true"
      >
        <Icon name="ph:trash" class="icon-sm" aria-hidden="true" />
        Видалити
      </button>
    </div>

    <div v-if="error" class="error-box" role="alert">{{ error }}</div>

    <form class="card stack" @submit.prevent="save">
      <div class="admin-work-grid">
        <div class="field">
          <label for="fig-title">Назва</label>
          <input id="fig-title" v-model="title" required @blur="onTitleBlur">
        </div>
        <div class="field">
          <label for="fig-slug">Slug (URL)</label>
          <input id="fig-slug" v-model="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*">
        </div>
        <div class="field">
          <label for="fig-price">Ціна, грн</label>
          <input id="fig-price" v-model.number="priceUah" type="number" min="1" required>
        </div>
        <div class="field">
          <label for="fig-height">Висота, см</label>
          <input id="fig-height" v-model.number="heightCm" type="number" min="1" step="0.1" required>
        </div>
        <div class="field">
          <label for="fig-scale">Масштаб</label>
          <input id="fig-scale" v-model="scale" placeholder="1/7">
        </div>
        <div class="field">
          <label for="fig-franchise">Серія</label>
          <input id="fig-franchise" v-model="franchise">
        </div>
        <div class="field">
          <label for="fig-status">Наявність</label>
          <select id="fig-status" v-model="status">
            <option v-for="item in FIGURINE_STATUSES" :key="item" :value="item">
              {{ FIGURINE_STATUS_LABELS[item] }}
            </option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="fig-aliases">Аліаси (через кому)</label>
        <input id="fig-aliases" v-model="aliasesText">
      </div>

      <div class="field">
        <label for="fig-alt">Alt зображення</label>
        <input id="fig-alt" v-model="imageAlt" required>
      </div>

      <div class="field">
        <label for="fig-seo-title">SEO-заголовок</label>
        <input id="fig-seo-title" v-model="seoTitle" required>
      </div>

      <div class="field">
        <label for="fig-seo-desc">SEO-опис</label>
        <textarea id="fig-seo-desc" v-model="seoDescription" rows="3" required />
      </div>

      <div class="field">
        <label for="fig-desc">Опис на сторінці</label>
        <textarea id="fig-desc" v-model="description" rows="5" required />
      </div>

      <label class="checkbox">
        <input v-model="published" type="checkbox">
        <span>Опубліковано на сайті</span>
      </label>

      <div class="row row-end">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Зберігаємо…' : 'Зберегти' }}
        </button>
      </div>
    </form>

    <div v-if="!isNew" class="card stack">
      <h2>Обкладинка</h2>
      <img
        v-if="image"
        class="admin-catalog-preview"
        :src="image"
        :alt="imageAlt || title"
      >
      <div class="field">
        <label for="cover-file">Завантажити обкладинку (PNG, JPG, WEBP до 10 МБ)</label>
        <input
          id="cover-file"
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          :disabled="uploading"
          @change="uploadCover(($event.target as HTMLInputElement).files)"
        >
      </div>
    </div>

    <div v-if="!isNew" class="card stack">
      <h2>Кадри обертання</h2>
      <p class="muted">
        Знімайте по колу з кроком близько {{ TURNTABLE_TARGET_STEP_DEG }}°
        ({{ TURNTABLE_TARGET_FRAMES }} кадрів від -180° до +180°).
        Завантажені фото потрапляють у список - перетягніть кожне на слот із потрібним градусом.
        Останній слот на сайті закриється першим кадром. PNG, JPG або WEBP до 10 МБ.
      </p>

      <FigurineTurntable
        v-if="draftScrubFrames?.length"
        class="admin-turntable-preview"
        :image="draftScrubFrames[draftCenter]!"
        :image-alt="imageAlt || title"
        :frames="draftScrubFrames"
        :frame-meta="draftScrubMeta"
      />
      <FigurineTurntable
        v-else-if="previewFrames.length"
        class="admin-turntable-preview"
        :image="image || previewFrames[Math.floor(previewFrames.length / 2)]!"
        :image-alt="imageAlt || title"
        :frames="previewFrames"
      />

      <div class="field">
        <label for="turntable-files">Додати фото</label>
        <input
          id="turntable-files"
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          :disabled="uploading"
          @change="
            addDraftFiles(($event.target as HTMLInputElement).files);
            ($event.target as HTMLInputElement).value = ''
          "
        >
      </div>

      <p class="admin-turntable-strip__count" role="status">{{ draftCountLabel }}</p>
      <p
        v-if="draftHint"
        class="muted"
        :class="{
          'admin-turntable-strip__soft-warn':
            filledSlotCount > 0 && !draftReady,
        }"
        role="status"
      >
        {{ draftHint }}
      </p>

      <div
        v-if="draftPool.length"
        class="admin-turntable-pool"
        role="list"
        aria-label="Список завантажених фото"
        @dragover.prevent
        @drop.prevent="onPoolDrop($event)"
      >
        <div
          v-for="frame in draftPool"
          :key="frame.key"
          class="admin-turntable-pool__card"
          role="listitem"
        >
          <button
            type="button"
            class="admin-turntable-pool__thumb"
            :draggable="!uploading"
            :disabled="uploading"
            :aria-label="`Перетягніть на слот або відкрийте огляд: ${frame.name}`"
            @dragstart="onPoolDragStart(frame.key, $event)"
            @click="openPoolPreview(frame.key)"
          >
            <img
              :src="frame.url"
              :alt="frame.name"
              width="88"
              height="88"
              draggable="false"
            >
          </button>
          <p class="admin-turntable-pool__name" :title="frame.name">
            {{ frame.name }}
          </p>
          <button
            type="button"
            class="btn btn-ghost admin-turntable-pool__remove"
            :disabled="uploading"
            :aria-label="`Прибрати ${frame.name}`"
            @click="removePoolFrame(frame.key)"
          >
            <Icon name="ph:trash" class="icon-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="admin-turntable-strip" role="list" aria-label="Слоти градусів">
        <div
          v-for="slot in draftStripSlots"
          :key="slot.frame?.key ?? `empty-${slot.index}`"
          class="admin-turntable-strip__slot"
          role="listitem"
          :class="{
            'is-empty': slot.isEmpty,
            'is-selected': selectedSlot === slot.index,
            'is-back': slot.isBack,
            'is-front': slot.isFront,
            'is-tail': slot.isTail,
            'is-drop-target': dragOverSlot === slot.index,
          }"
          @dragenter.prevent="onSlotDragOver(slot.index, $event)"
          @dragover="onSlotDragOver(slot.index, $event)"
          @dragleave="onSlotDragLeave(slot.index)"
          @drop="onSlotDrop(slot.index, $event)"
        >
          <span class="admin-turntable-strip__yaw">{{ slot.yawLabel }}</span>
          <button
            v-if="slot.frame"
            type="button"
            class="admin-turntable-strip__thumb"
            draggable="true"
            :disabled="uploading"
            :aria-label="`${slot.yawLabel}${slot.role ? `, ${slot.role}` : ''}. ${slot.frame.name}`"
            :aria-pressed="selectedSlot === slot.index"
            @click="selectSlot(slot.index)"
            @dragstart="onSlotDragStart(slot.index, $event)"
          >
            <img
              :src="slot.frame.url"
              :alt="slot.frame.name"
              width="88"
              height="88"
              draggable="false"
            >
          </button>
          <div
            v-else
            class="admin-turntable-strip__placeholder"
            :aria-label="`Порожній слот ${slot.yawLabel}`"
          />
          <span v-if="slot.role" class="admin-turntable-strip__role">
            {{ slot.role }}
          </span>
          <span
            v-else-if="slot.frame"
            class="admin-turntable-strip__role admin-turntable-strip__role--file"
            :title="slot.frame.name"
          >
            {{ slot.frame.name }}
          </span>
        </div>
      </div>

      <div
        v-if="filledSlotCount || draftPool.length"
        class="admin-turntable-strip__toolbar row"
      >
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="!draftReady || selectedSlot === draftCenter || uploading || !draftSlots[selectedSlot]"
          @click="makeSelectedFront"
        >
          Це анфас
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="uploading || !draftSlots[selectedSlot]"
          aria-label="Відкрити огляд"
          @click="openSlotPreview(selectedSlot)"
        >
          <Icon name="ph:arrows-out" class="icon-sm" aria-hidden="true" />
          Огляд
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="uploading || !draftSlots[selectedSlot]"
          aria-label="Повернути кадр у список"
          @click="unassignSlot(selectedSlot)"
        >
          <Icon name="ph:arrow-u-up-left" class="icon-sm" aria-hidden="true" />
          У список
        </button>
      </div>

      <div v-if="filledSlotCount || draftPool.length" class="row">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!draftReady || uploading"
          @click="saveDraftFrames"
        >
          {{ uploading ? 'Зберігаємо…' : 'Зберегти кадри' }}
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          :disabled="uploading"
          @click="clearDraft"
        >
          Скинути чернетку
        </button>
      </div>
    </div>

    <ImagePreviewModal
      v-model:open="previewOpen"
      v-model:index="previewIndex"
      :images="previewImages"
      :alt="imageAlt || title"
      title="Огляд кадру обертання"
    />

    <AppModal v-model:open="deleteOpen" title="Видалити фігурку?">
      <div class="stack">
        <p>Позицію «{{ title }}» буде видалено з каталогу. Це нескасовно.</p>
        <div class="row row-end">
          <button type="button" class="btn btn-ghost" @click="deleteOpen = false">
            Скасувати
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="deleting"
            @click="removeProduct"
          >
            {{ deleting ? 'Видаляємо…' : 'Видалити' }}
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
