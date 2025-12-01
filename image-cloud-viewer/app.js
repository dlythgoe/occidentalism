// State management
let imageData = []
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
const tooltip = document.getElementById("tooltip")
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

// Papers data - can also be moved to a JSON file later
const PAPERS_DATA = [
  {
    title: "The Semiotics of Consumer Culture: A Study of Coca-Cola Imagery",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.`,
  },
  {
    title: "Velocity and Identity: Sports Cars in Western Visual Culture",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.

Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.

Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.

Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.

Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc. Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit.`,
  },
  {
    title: "Bodies Exposed: Nakedness and Power in Contemporary Media",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.

Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.

Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.

Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.

Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.

Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam.`,
  },
  {
    title: "Visual Resistance: The Aesthetics of Protest Photography",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor.

Donec laoreet nonummy augue. Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend.

Ut nonummy. Fusce aliquet pede non pede. Suspendisse dapibus lorem pellentesque magna. Integer nulla. Donec blandit feugiat ligula.

Donec hendrerit, felis et imperdiet euismod, purus ipsum pretium metus, in lacinia nulla nisl eget sapien. Donec ut est in lectus consequat consequat. Etiam eget dui. Aliquam erat volutpat.

Sed at lorem in nunc porta tristique. Proin nec augue. Quisque aliquam tempor magna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Nunc ac magna. Maecenas odio dolor, vulputate vel, auctor ac, accumsan id, felis. Pellentesque cursus sagittis felis. Pellentesque porttitor, velit lacinia egestas auctor, diam eros tempus arcu.`,
  },
  {
    title: "Brand Mythology: Coca-Cola and the American Dream",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.

Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.

Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna.

Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.

Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.

In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris.`,
  },
  {
    title: "Speed and Spectacle: The Cultural Politics of Automotive Design",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui.

Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia.

Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris.

Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus.

Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede.

Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque.`,
  },
  {
    title: "Dissent and Documentation: A Visual History of Western Protest Movements",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor. Donec laoreet nonummy augue.

Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend. Ut nonummy.

Fusce aliquet pede non pede. Suspendisse dapibus lorem pellentesque magna. Integer nulla. Donec blandit feugiat ligula. Donec hendrerit, felis et imperdiet euismod, purus ipsum pretium metus.

In lacinia nulla nisl eget sapien. Donec ut est in lectus consequat consequat. Etiam eget dui. Aliquam erat volutpat. Sed at lorem in nunc porta tristique.

Proin nec augue. Quisque aliquam tempor magna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc ac magna.`,
  },
]

const imageDimensions = new Map()

async function init() {
  try {
    // Fetch image data from JSON file
    const response = await fetch("data/index.json")
    if (!response.ok) {
      throw new Error("Failed to load data/index.json")
    }
    imageData = await response.json()

    // Extract all unique tags
    imageData.forEach((item) => {
      item.tags.forEach((tag) => allTags.add(tag))
    })

    // Create filter buttons
    createTagFilters()

    await loadImageDimensions()

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

    imageItem.addEventListener("mouseenter", (e) => {
      showTooltip(e, item)
    })
    imageItem.addEventListener("mousemove", moveTooltip)

    imageItem.addEventListener("click", () => showModal(item))

    board.appendChild(imageItem)

    currentX += displayWidth + spacing
    rowWidth += displayWidth + spacing
    rowHeight = Math.max(rowHeight, displayHeight)
  })
}

function showTooltip(e, item) {
  tooltip.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.description}</p>
        <div class="tooltip-tags">
            ${item.tags.map((tag) => `<span class="tooltip-tag">${tag}</span>`).join("")}
        </div>
    `
  tooltip.classList.remove("hidden")
  moveTooltip(e)
}

function moveTooltip(e) {
  tooltip.style.left = `${e.clientX + 15}px`
  tooltip.style.top = `${e.clientY + 15}px`
}

function hideTooltip() {
  tooltip.classList.add("hidden")
}

function showModal(item) {
  modalImage.src = `images/${item.filename}`
  modalTitle.textContent = item.title
  modalDescription.textContent = item.description
  modalDate.textContent = `Date: ${item.date}`

  modalTags.innerHTML = item.tags.map((tag) => `<span class="modal-tag">${tag}</span>`).join("")

  modal.classList.remove("hidden")
}

function hideModal() {
  modal.classList.add("hidden")
}

function showPaperModal(paper) {
  paperTitle.textContent = paper.title
  paperBody.innerHTML = paper.body
    .split("\n\n")
    .map((p) => `<p>${p}</p>`)
    .join("")
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

  PAPERS_DATA.forEach((paper) => {
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
    if (e.target === viewport || e.target === board || e.target.classList.contains("image-item")) {
      startX = e.clientX - translateX
      startY = e.clientY - translateY
      panStarted = false
    }
  })

  document.addEventListener("mousemove", (e) => {
    const isOverImage = e.target.closest(".image-item")
    if (!isOverImage) {
      hideTooltip()
    }

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

  document.addEventListener("mouseup", () => {
    isPanning = false
    panStarted = false
    startX = 0
    startY = 0
    viewport.classList.remove("grabbing")
  })

  modalClose.addEventListener("click", hideModal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal()
    }
  })

  paperModalClose.addEventListener("click", hidePaperModal)
  paperModal.addEventListener("click", (e) => {
    if (e.target === paperModal) {
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
