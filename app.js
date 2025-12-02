// State management
let imageData = []
let papersData = []
const activeTags = new Set()
const allTags = new Set()

// Pan state
let translateX = 0
let translateY = 0
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
const modalDate = document.getElementById("modal-date")
const modalClose = document.getElementById("modal-close")
const resetFiltersBtn = document.getElementById("reset-filters")
const resetViewBtn = document.getElementById("reset-view")
const toggleFiltersBtn = document.getElementById("toggle-filters")
const togglePapersBtn = document.getElementById("toggle-papers")
const filterContainer = document.getElementById("filter-container")
const papersContainer = document.getElementById("papers-container")
const papersList = document.getElementById("papers-list")
const paperModal = document.getElementById("paper-modal")
const paperModalClose = document.getElementById("paper-modal-close")
const paperTitle = document.getElementById("paper-title")
const paperBody = document.getElementById("paper-body")

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
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Footnote references - now clickable with href
    .replace(/\[\^(\d+)\]/g, '<sup class="footnote-ref"><a href="#fn-$1" data-footnote="$1">[$1]</a></sup>')
    // Regular links [text](url)
    .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank">$1</a>')
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

  const maxWidth = 300
  const spacing = 30
  let currentX = 100
  let currentY = 100
  let rowHeight = 0
  let rowWidth = 0
  const maxRowWidth = 1200

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

    const imageItem = document.createElement("div")
    imageItem.className = "image-item"
    imageItem.style.left = `${currentX}px`
    imageItem.style.top = `${currentY}px`
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
}

function showModal(item) {
  modalImage.src = `images/${item.filename}`
  modalTitle.textContent = item.title
  modalDescription.textContent = item.description
  modalDate.textContent = `Date: ${item.date}`

  modalTags.innerHTML = item.tags.map((tag) => `<span class="modal-tag">${tag}</span>`).join("")

  modal.classList.remove("hidden")
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
    modalDate.textContent = ""
    modalTags.innerHTML = ""
    modal.classList.remove("hidden")
  }
}

function hideModal() {
  modal.classList.add("hidden")
}

function showPaperModal(paper) {
  paperTitle.textContent = paper.title
  paperBody.innerHTML = parseMarkdown(paper.content || "")

  const paperImages = paperBody.querySelectorAll(".paper-image")
  paperImages.forEach((img) => {
    img.addEventListener("click", () => {
      showModalByFilename(img.dataset.filename)
    })
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

function updateTransform() {
  board.style.transform = `translate(${translateX}px, ${translateY}px)`
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
