// State management
let imageData = []
let papersData = []
const activeTags = new Set()
const allTags = new Set()

// Pan state
let translateX = 0
let translateY = 0
let contentBounds = null // bounding box of rendered images, used to clamp panning
let isPanning = false
let startX = 0
let startY = 0

// DOM elements
const board = document.getElementById("board")
const viewport = document.getElementById("viewport")
const tagFiltersContainer = document.getElementById("tag-filters")
const modal = document.getElementById("modal")
const modalImage = document.getElementById("modal-image")
const modalTitle = document.getElementById("modal-title")
const modalDescription = document.getElementById("modal-description")
const modalTags = document.getElementById("modal-tags")
const modalCredit = document.getElementById("modal-credit")
const modalClose = document.getElementById("modal-close")
const resetFiltersBtn = document.getElementById("reset-filters")
const resetViewBtn = document.getElementById("reset-view")
const toggleFiltersBtn = document.getElementById("toggle-filters")
const togglePapersBtn = document.getElementById("toggle-papers")
const toggleAboutBtn = document.getElementById("toggle-about")
const filterContainer = document.getElementById("filter-container")
const papersContainer = document.getElementById("papers-container")
const papersList = document.getElementById("papers-list")
const paperModal = document.getElementById("paper-modal")
const paperModalClose = document.getElementById("paper-modal-close")
const paperTitle = document.getElementById("paper-title")
const paperBody = document.getElementById("paper-body")
const paperModalContent = document.getElementById("paper-modal-content") // Added for scroll detection

const imageDimensions = new Map()

function parseMarkdown(text) {
  let processedText = text.replace(/^# .+$/m, "").trim()

  const footnotes = {}
  processedText = processedText.replace(/^\[\^(\d+)\]:\s*(.+)$/gm, (match, num, content) => {
    footnotes[num] = content
    return ""
  })

  // Manual image parsing - find ![alt](src) patterns without regex parentheses issues
  let result = ""
  let i = 0
  while (i < processedText.length) {
    // Look for image pattern: ![
    if (processedText[i] === "!" && processedText[i + 1] === "[") {
      const altStart = i + 2
      const altEnd = processedText.indexOf("]", altStart)
      if (altEnd !== -1 && processedText[altEnd + 1] === "(") {
        const srcStart = altEnd + 2
        const srcEnd = processedText.indexOf(")", srcStart)
        if (srcEnd !== -1) {
          const alt = processedText.substring(altStart, altEnd)
          const src = processedText.substring(srcStart, srcEnd)
          // Normalize path: ../images/file.jpg -> images/file.jpg
          const normalizedSrc = src.replace(/^\.\.\//, "")
          const filename = normalizedSrc.replace(/^images\//, "")
          result +=
            '<img src="' + normalizedSrc + '" alt="' + alt + '" class="paper-image" data-filename="' + filename + '" />'
          i = srcEnd + 1
          continue
        }
      }
    }
    result += processedText[i]
    i++
  }
  processedText = result

  let html = processedText
    // Headers (H2 and H3 only, H1 removed above)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // Blockquotes (consecutive "> " lines become one blockquote)
    .replace(/(?:^> ?.*(?:\n|$))+/gm, (block) => {
      const content = block
        .trim()
        .split("\n")
        .map((line) => line.replace(/^> ?/, ""))
        .join("\n")
      return "<blockquote>" + content + "</blockquote>\n"
    })
    // Unordered lists ("- item" or "* item" lines)
    .replace(/(?:^[-*] .*(?:\n|$))+/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((line) => "<li>" + line.replace(/^[-*] /, "") + "</li>")
        .join("")
      return "<ul>" + items + "</ul>\n"
    })
    // Ordered lists ("1. item" lines)
    .replace(/(?:^\d+\. .*(?:\n|$))+/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((line) => "<li>" + line.replace(/^\d+\. /, "") + "</li>")
        .join("")
      return "<ol>" + items + "</ol>\n"
    })
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Footnote references - now clickable with href
    .replace(/\[\^(\d+)\]/g, '<sup class="footnote-ref"><a href="#fn-$1" data-footnote="$1">[$1]</a></sup>')
    // Regular links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines to <br>
    .replace(/\n/g, "<br>")

  html = "<p>" + html + "</p>"

  const footnoteNums = Object.keys(footnotes)
  if (footnoteNums.length > 0) {
    html += '<div class="footnotes"><hr><ol>'
    footnoteNums
      .sort((a, b) => Number(a) - Number(b))
      .forEach((num) => {
        html += '<li id="fn-' + num + '">' + footnotes[num] + "</li>"
      })
    html += "</ol></div>"
  }

  return html
}

const ABOUT_TITLE = "Occidentalism\nImages for the so-called West"

const ABOUT_CONTENT = `### Art Research & Media Philosophy Seminar

![Recreational facility in Samanid Park in Bukhara (Uzbekistan), March 12, 2025. Photo: Matthias Bruhn](images/bukhara_playground.jpg)

*Recreational facility in Samanid Park in Bukhara (Uzbekistan), March 12, 2025. Photo: Matthias Bruhn*

What does the term "the West" still stand for today? In the wake of globalization, its meaning has shifted repeatedly and now encompasses industrialized nations that may be located in East Asia and the South Pacific. The division between a global North and South also presents its own challenges. As an imaginary point of reference—and a symbol of both friend and foe—the West has clearly not yet outlived its usefulness. This provides an opportunity for an iconographic assessment.

The seminar has compiled images of social stereotypes, idealized representations, and caricatures that do not necessarily originate in the West but are somehow meant to represent it. For the tour, the gatehouse in the entrance area of the HfG will be redesigned to display a selection of examples. The architecture itself serves as a model of Western modernism.

**Participants:** Marie Herrndorff, Wera Hertenstein, Michael Janus, Lorena Karn, Darius Kühner, Florian Lips, Daniel Lythgoe, Michelle Nikolas, Alena Poser, Yidan Qin, Helena Schenk, Leonie Werner, and Julia Ziegler

**Director:** Matthias Bruhn (Art Research & Media Philosophy)

*Website design and development: Daniel Louis Lythgoe*`

function showAboutModal() {
  showPaperModal({ title: ABOUT_TITLE, content: ABOUT_CONTENT })
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function init() {
  try {
    // Fetch image data from JSON file
    const response = await fetch("data/index.json")
    if (!response.ok) {
      throw new Error("Failed to load data/index.json")
    }
    imageData = await response.json()

    imageData = shuffleArray(imageData)

    try {
      const papersResponse = await fetch("data/papers.json")
      if (papersResponse.ok) {
        papersData = await papersResponse.json()
      }
    } catch (e) {
      console.log("No papers.json found, papers list will be empty")
      papersData = []
    }

    // Extract all unique tags
    imageData.forEach((item) => {
      item.tags.forEach((tag) => allTags.add(tag))
    })

    // Create filter buttons
    createTagFilters()

    await loadImageDimensions()

    await loadPaperContents()

    // Position and render images
    renderImages()

    // Center the view
    centerView()

    createPapersList()

    // Setup event listeners
    setupEventListeners()
  } catch (error) {
    console.error("Error during initialization:", error)
    board.innerHTML =
      '<p style="color: #000; padding: 20px;">Error loading images. Make sure data/index.json exists and you are running from a web server (not file://).</p>'
  }
}

async function loadImageDimensions() {
  const promises = imageData.map((item) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        imageDimensions.set(item.filename, {
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
        resolve()
      }
      img.onerror = () => {
        imageDimensions.set(item.filename, { width: 200, height: 200 })
        resolve()
      }
      img.src = `images/${item.filename}`
    })
  })

  await Promise.all(promises)
}

async function loadPaperContents() {
  const promises = papersData.map(async (paper) => {
    try {
      const response = await fetch(`papers/${paper.filename}`)
      if (response.ok) {
        paper.content = await response.text()
      } else {
        paper.content = "Paper content not found."
      }
    } catch (e) {
      paper.content = "Error loading paper content."
    }
  })

  await Promise.all(promises)
}

function createTagFilters() {
  const sortedTags = Array.from(allTags).sort()

  sortedTags.forEach((tag) => {
    const button = document.createElement("button")
    button.className = "tag-filter"
    button.textContent = tag
    button.dataset.tag = tag

    button.addEventListener("click", () => {
      button.classList.toggle("active")

      if (button.classList.contains("active")) {
        activeTags.add(tag)
      } else {
        activeTags.delete(tag)
      }

      renderImages()
      centerView()
    })

    tagFiltersContainer.appendChild(button)
  })
}

function renderImages() {
  board.innerHTML = ""

  const filteredData =
    activeTags.size === 0 ? imageData : imageData.filter((item) => item.tags.some((tag) => activeTags.has(tag)))

  const maxWidth = 450
  const spacing = 60
  const jitterX = 134 // random offset from the base grid; larger than spacing/2 allows slight overlaps
  const jitterY = 166
  let currentX = 100
  let currentY = 100
  let rowHeight = 0
  let rowWidth = 0
  const maxRowWidth = 2700 // fits 5 columns of max-width images

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  filteredData.forEach((item, index) => {
    const dims = imageDimensions.get(item.filename)
    if (!dims) return

    const aspectRatio = dims.width / dims.height
    const displayWidth = Math.min(maxWidth, dims.width)
    const displayHeight = displayWidth / aspectRatio

    if (rowWidth + displayWidth > maxRowWidth && rowWidth > 0) {
      currentX = 100
      currentY += rowHeight + spacing
      rowHeight = 0
      rowWidth = 0
    }

    const x = currentX + (Math.random() - 0.5) * 2 * jitterX
    const y = currentY + (Math.random() - 0.5) * 2 * jitterY

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + displayWidth)
    maxY = Math.max(maxY, y + displayHeight)

    const imageItem = document.createElement("div")
    imageItem.className = "image-item"
    imageItem.style.left = `${x}px`
    imageItem.style.top = `${y}px`
    imageItem.dataset.tags = JSON.stringify(item.tags)
    imageItem.dataset.filename = item.filename

    const img = document.createElement("img")
    img.src = `images/${item.filename}`
    img.alt = item.title
    img.loading = "lazy"
    img.style.width = `${displayWidth}px`
    img.style.height = `${displayHeight}px`

    img.onerror = function () {
      this.style.display = "none"
      const errorMsg = document.createElement("div")
      errorMsg.style.cssText = "color: #ff0000; font-size: 12px; padding: 10px; text-align: center;"
      errorMsg.textContent = `Image not found: ${item.filename}`
      imageItem.appendChild(errorMsg)
    }

    imageItem.appendChild(img)

    imageItem.addEventListener("click", () => showModal(item))

    board.appendChild(imageItem)

    currentX += displayWidth + spacing
    rowWidth += displayWidth + spacing
    rowHeight = Math.max(rowHeight, displayHeight)
  })

  contentBounds = minX === Number.POSITIVE_INFINITY ? null : { minX, minY, maxX, maxY }
}

function clampPan() {
  if (!contentBounds) return
  const visible = 150 // at least this much content must stay in view on each axis
  const minTx = visible - contentBounds.maxX
  const maxTx = viewport.clientWidth - visible - contentBounds.minX
  const minTy = visible - contentBounds.maxY
  const maxTy = viewport.clientHeight - visible - contentBounds.minY
  translateX = Math.min(maxTx, Math.max(minTx, translateX))
  translateY = Math.min(maxTy, Math.max(minTy, translateY))
}

function showModal(item) {
  modalImage.src = `images/${item.filename}`
  modalTitle.textContent = item.title
  modalDescription.textContent = item.description
  modalCredit.textContent = item.credit || ""

  modalTags.innerHTML = item.tags.map((tag) => `<span class="modal-tag">${tag}</span>`).join("")

  modal.classList.remove("hidden")
  modal.style.zIndex = "3000" // Updated to ensure image modal is above paper modal
}

function showModalByFilename(filename) {
  const item = imageData.find((img) => img.filename === filename)
  if (item) {
    showModal(item)
  } else {
    // If image not in index, show basic modal
    modalImage.src = `images/${filename}`
    modalTitle.textContent = filename
    modalDescription.textContent = ""
    modalCredit.textContent = ""
    modalTags.innerHTML = ""
    modal.classList.remove("hidden")
    modal.style.zIndex = "3000" // Updated to ensure image modal is above paper modal
  }
}

function hideModal() {
  modal.classList.add("hidden")
}

function showPaperModal(paper) {
  paperTitle.textContent = paper.title
  paperBody.innerHTML = parseMarkdown(paper.content || "")

  // Mark leading subtitle/author lines (italic-only paragraphs or an opening H3) for centred styling
  let leadEl = paperBody.firstElementChild
  let lastMeta = null
  while (leadEl) {
    const isEmptyP = leadEl.tagName === "P" && leadEl.textContent.trim() === ""
    const isEmOnly =
      leadEl.tagName === "P" &&
      leadEl.firstElementChild &&
      leadEl.firstElementChild.tagName === "EM" &&
      leadEl.firstElementChild.textContent.trim() === leadEl.textContent.trim()
    if (isEmptyP) {
      leadEl = leadEl.nextElementSibling
      continue
    }
    if (isEmOnly || leadEl.tagName === "H3") {
      leadEl.classList.add("paper-meta")
      lastMeta = leadEl
      leadEl = leadEl.nextElementSibling
      continue
    }
    break
  }
  if (lastMeta) lastMeta.classList.add("paper-meta-last")

  const paperImages = paperBody.querySelectorAll(".paper-image")
  paperImages.forEach((img) => {
    img.addEventListener("click", () => {
      showModalByFilename(img.dataset.filename)
    })

    // italic-only paragraph directly after an image = caption
    const imgP = img.closest("p")
    const next = imgP && imgP.nextElementSibling
    if (
      next &&
      next.tagName === "P" &&
      next.firstElementChild &&
      next.firstElementChild.tagName === "EM" &&
      next.firstElementChild.textContent.trim() === next.textContent.trim()
    ) {
      next.classList.add("paper-caption")
    }
  })

  const footnoteRefs = paperBody.querySelectorAll(".footnote-ref a")
  footnoteRefs.forEach((ref) => {
    ref.addEventListener("click", (e) => {
      e.preventDefault()
      const footnoteId = ref.getAttribute("href").substring(1)
      const footnoteEl = document.getElementById(footnoteId)
      if (footnoteEl) {
        footnoteEl.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    })
  })

  paperModal.classList.remove("hidden")
}

function hidePaperModal() {
  paperModal.classList.add("hidden")
}

// --- Subtle parallax: mouse movement gives the canvas a gentle push ---
// Velocity-based: each cursor movement adds an impulse against the direction of
// travel; the canvas glides on in that direction and decelerates to a stop
// (no spring-back).
let parallaxVX = 0
let parallaxVY = 0
let parallaxRAF = null
let lastMouseX = null
let lastMouseY = null
const PARALLAX_IMPULSE = -0.01 // velocity gained per px of cursor movement
const PARALLAX_DAMPING = 0.93 // velocity kept per frame (higher = longer glide)

function updateParallax(e) {
  if (isPanning || !modal.classList.contains("hidden") || !paperModal.classList.contains("hidden")) {
    lastMouseX = null
    lastMouseY = null
    return
  }
  if (lastMouseX !== null) {
    parallaxVX += (e.clientX - lastMouseX) * PARALLAX_IMPULSE
    parallaxVY += (e.clientY - lastMouseY) * PARALLAX_IMPULSE
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  if (!parallaxRAF) parallaxRAF = requestAnimationFrame(stepParallax)
}

function stepParallax() {
  parallaxRAF = null
  parallaxVX *= PARALLAX_DAMPING
  parallaxVY *= PARALLAX_DAMPING
  translateX += parallaxVX
  translateY += parallaxVY
  clampPan()
  updateTransform()
  if (Math.abs(parallaxVX) > 0.05 || Math.abs(parallaxVY) > 0.05) {
    parallaxRAF = requestAnimationFrame(stepParallax)
  }
}

function updateTransform() {
  board.style.transform = `translate(${translateX}px, ${translateY}px)`
}

// --- Edge panning: the canvas drifts when the cursor nears a screen edge ---
let edgeVX = 0
let edgeVY = 0
let edgePanRAF = null

function updateEdgePan(e) {
  // inactive while dragging, over the controls, or with a modal open
  if (
    isPanning ||
    !modal.classList.contains("hidden") ||
    !paperModal.classList.contains("hidden") ||
    e.target.closest("#controls")
  ) {
    setEdgePan(0, 0)
    return
  }

  const w = viewport.clientWidth
  const h = viewport.clientHeight
  const marginX = w * 0.11
  const marginY = h * 0.11
  const minSpeed = 0.4 // px per frame just inside the margin
  const maxSpeed = 2.6 // px per frame — deliberately slow
  const plateau = 0.85 // fraction of the margin after which speed stays at max

  const speed = (depth) => minSpeed + Math.min(1, depth / plateau) * (maxSpeed - minSpeed)

  const axisV = (pos, size, margin) => {
    if (pos < margin) return speed(1 - pos / margin) // reveal content on the low side
    if (pos > size - margin) return -speed(1 - (size - pos) / margin)
    return 0
  }

  let vx = axisV(e.clientX, w, marginX)
  let vy = axisV(e.clientY, h, marginY)

  // Near a corner, let the second axis engage from further in so the
  // diagonal starts before the very corner
  const cornerExpand = 1.6
  if (vx !== 0 && vy === 0) vy = axisV(e.clientY, h, marginY * cornerExpand)
  if (vy !== 0 && vx === 0) vx = axisV(e.clientX, w, marginX * cornerExpand)

  setEdgePan(vx, vy)
  if (vx !== 0 || vy !== 0) positionEdgeCursor(e)
}

// Chevron (arrowhead) drawn as a DOM overlay instead of a native cursor, so it
// can be clamped to stay fully visible inside the window at the screen edges.
const edgeCursorEl = document.createElement("div")
edgeCursorEl.id = "edge-cursor"
edgeCursorEl.innerHTML =
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">` +
  `<path d="M8 32 L24 10 L40 32" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M8 32 L24 10 L40 32" fill="none" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
  `</svg>`
document.body.appendChild(edgeCursorEl)

function positionEdgeCursor(e) {
  const size = 48
  const x = Math.min(Math.max(e.clientX - size / 2, 0), window.innerWidth - size)
  const y = Math.min(Math.max(e.clientY - size / 2, 0), window.innerHeight - size)
  edgeCursorEl.style.left = `${x}px`
  edgeCursorEl.style.top = `${y}px`
}

function setEdgePan(vx, vy) {
  edgeVX = vx
  edgeVY = vy
  if (vx === 0 && vy === 0) {
    viewport.style.cursor = ""
    viewport.classList.remove("edge-panning")
    edgeCursorEl.style.display = "none"
    return
  }
  // hide the native cursor, point the overlay chevron in the drift direction
  const vecX = vx > 0 ? -1 : vx < 0 ? 1 : 0 // view movement direction on screen
  const vecY = vy > 0 ? -1 : vy < 0 ? 1 : 0
  const angle = (Math.atan2(vecX, -vecY) * 180) / Math.PI // up = 0deg
  edgeCursorEl.firstElementChild.style.transform = `rotate(${angle}deg)`
  edgeCursorEl.style.display = "block"
  viewport.style.cursor = "none"
  viewport.classList.add("edge-panning")
  if (!edgePanRAF) edgePanRAF = requestAnimationFrame(stepEdgePan)
}

function stepEdgePan() {
  edgePanRAF = null
  if (edgeVX === 0 && edgeVY === 0) return
  translateX += edgeVX
  translateY += edgeVY
  clampPan()
  updateTransform()
  edgePanRAF = requestAnimationFrame(stepEdgePan)
}

function centerView() {
  const imageItems = document.querySelectorAll(".image-item")

  if (imageItems.length === 0) {
    translateX = 0
    translateY = 0
    updateTransform()
    return
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  imageItems.forEach((item) => {
    const x = Number.parseInt(item.style.left)
    const y = Number.parseInt(item.style.top)
    const img = item.querySelector("img")
    const width = img ? img.offsetWidth : 200
    const height = img ? img.offsetHeight : 200

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  })

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const viewportCenterX = viewport.clientWidth / 2
  const viewportCenterY = viewport.clientHeight / 2

  translateX = viewportCenterX - centerX
  translateY = viewportCenterY - centerY

  updateTransform()
}

function resetView() {
  centerView()
}

function createPapersList() {
  papersList.innerHTML = ""

  papersData.forEach((paper) => {
    const paperItem = document.createElement("button")
    paperItem.className = "paper-item"
    paperItem.textContent = paper.title

    paperItem.addEventListener("click", () => {
      showPaperModal(paper)
    })

    papersList.appendChild(paperItem)
  })
}

function setupEventListeners() {
  let panStarted = false

  viewport.addEventListener("mousedown", (e) => {
    // Don't start pan if clicking on controls or modals
    if (e.target.closest("#controls") || e.target.closest("#modal") || e.target.closest("#paper-modal")) {
      return
    }
    startX = e.clientX - translateX
    startY = e.clientY - translateY
  })

  document.addEventListener("mousemove", (e) => {
    if (startX !== 0 || startY !== 0) {
      const deltaX = Math.abs(e.clientX - (startX + translateX))
      const deltaY = Math.abs(e.clientY - (startY + translateY))

      if (deltaX > 5 || deltaY > 5) {
        panStarted = true
        isPanning = true
        viewport.classList.add("grabbing")
      }

      if (isPanning) {
        translateX = e.clientX - startX
        translateY = e.clientY - startY
        clampPan()
        updateTransform()
      }
    }
  })

  document.addEventListener("mouseup", (e) => {
    const wasPanning = panStarted
    isPanning = false
    panStarted = false
    startX = 0
    startY = 0
    viewport.classList.remove("grabbing")
  })

  viewport.addEventListener(
    "wheel",
    (e) => {
      // Don't scroll if over controls or modals
      if (e.target.closest("#controls") || e.target.closest("#paper-modal")) {
        return
      }
      e.preventDefault()
      translateX -= e.deltaX
      translateY -= e.deltaY
      clampPan()
      updateTransform()
    },
    { passive: false },
  )

  modalClose.addEventListener("click", hideModal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal()
    }
  })

  paperModalClose.addEventListener("click", hidePaperModal)

  viewport.addEventListener("click", (e) => {
    if (!paperModal.classList.contains("hidden")) {
      hidePaperModal()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal()
      hidePaperModal()
    }
  })

  resetFiltersBtn.addEventListener("click", () => {
    activeTags.clear()
    document.querySelectorAll(".tag-filter").forEach((btn) => {
      btn.classList.remove("active")
    })
    renderImages()
    centerView()
  })

  resetViewBtn.addEventListener("click", resetView)

  document.getElementById("reload-btn").addEventListener("click", () => location.reload())

  // Edge panning: track cursor across the whole document so modals/controls can cancel it
  document.addEventListener("mousemove", updateEdgePan)
  document.addEventListener("mousemove", updateParallax)
  document.addEventListener("mouseleave", () => setEdgePan(0, 0))

  toggleFiltersBtn.addEventListener("click", () => {
    const isExpanded = filterContainer.style.display !== "none"
    filterContainer.style.display = isExpanded ? "none" : "block"
    toggleFiltersBtn.textContent = isExpanded ? "Tags [+]" : "Tags [-]"
  })

  togglePapersBtn.addEventListener("click", () => {
    const isExpanded = papersContainer.style.display !== "none"
    papersContainer.style.display = isExpanded ? "none" : "block"
    togglePapersBtn.textContent = isExpanded ? "Papers [+]" : "Papers [-]"
  })

  toggleAboutBtn.addEventListener("click", showAboutModal)

  // Added scroll detection for paper modal content to show/hide scrollbar
  let scrollTimeout
  let lastScrollTop = 0
  paperModalContent.addEventListener("scroll", () => {
    paperModalContent.classList.add("is-scrolling")
    // fade only in the direction of travel
    const top = paperModalContent.scrollTop
    if (top !== lastScrollTop) {
      paperModalContent.classList.toggle("scrolling-down", top > lastScrollTop)
      paperModalContent.classList.toggle("scrolling-up", top < lastScrollTop)
      lastScrollTop = top
    }
    // suppress the fade at the hard ends of the scroll range
    const atTop = top <= 0
    const atBottom = top + paperModalContent.clientHeight >= paperModalContent.scrollHeight - 1
    paperModalContent.classList.toggle("at-top", atTop)
    paperModalContent.classList.toggle("at-bottom", atBottom)
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      paperModalContent.classList.remove("is-scrolling")
    }, 1000)
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
