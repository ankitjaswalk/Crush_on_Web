/*--------------------
Vars
--------------------*/
let progress = 50
let startX = 0
let active = 0
let isDown = false

/*--------------------
Constants
--------------------*/
const speedWheel = 0.02
const speedDrag = -0.1

/*--------------------
Get Z
--------------------*/
const getZindex = (array, index) =>
  array.map((_, i) => (index === i ? array.length : array.length - Math.abs(index - i)))

/*--------------------
Items
--------------------*/
const $items = document.querySelectorAll('.carousel-item')
const $cursors = document.querySelectorAll('.cursor')

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  item.style.setProperty('--active', (index - active) / $items.length)
}

/*--------------------
Animate
--------------------*/
const animate = () => {
  progress = Math.max(0, Math.min(progress, 100))
  active = Math.floor((progress / 100) * ($items.length - 1))

  $items.forEach((item, index) => displayItems(item, index, active))
}
animate()

/*--------------------
Click on Items
--------------------*/
$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    progress = (i / $items.length) * 100 + 10
    animate()
  })
})

/*--------------------
Handlers
--------------------*/
const handleWheel = (e) => {
  const wheelProgress = e.deltaY * speedWheel
  progress = progress + wheelProgress
  animate()
  hideHint()
}

const handleMouseMove = (e) => {
  if (e.type === 'mousemove') {
    $cursors.forEach(($cursor) => {
      $cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    })
  }
  if (!isDown) return
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const mouseProgress = (x - startX) * speedDrag
  progress = progress + mouseProgress
  startX = x
  animate()
  hideHint()
}

const handleMouseDown = (e) => {
  isDown = true
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0
}

const handleMouseUp = () => {
  isDown = false
}

/*--------------------
Loading Screen
--------------------*/
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loadingScreen')
  setTimeout(() => {
    loadingScreen.classList.add('hidden')
  }, 1800)
})

/*--------------------
Navigation Hint
--------------------*/
const navHint = document.getElementById('navHint')
let hintHidden = false

function hideHint() {
  if (!hintHidden && navHint) {
    hintHidden = true
    navHint.classList.add('hidden')
  }
}

/*--------------------
Listeners
--------------------*/
document.addEventListener('wheel', handleWheel, { passive: true })
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
document.addEventListener('touchstart', handleMouseDown)
document.addEventListener('touchmove', handleMouseMove)
document.addEventListener('touchend', handleMouseUp)

/*--------------------
Note Form
--------------------*/
const noteToggle = document.getElementById('noteToggle')
const noteFormContainer = document.getElementById('noteFormContainer')
const noteForm = document.getElementById('noteForm')
const noteStatus = document.getElementById('noteStatus')

noteToggle.addEventListener('click', () => {
  noteFormContainer.classList.toggle('open')
})

document.addEventListener('click', (e) => {
  if (!e.target.closest('.note-section')) {
    noteFormContainer.classList.remove('open')
  }
})

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const submitBtn = noteForm.querySelector('.note-submit')
  submitBtn.disabled = true
  submitBtn.textContent = 'Sending...'
  noteStatus.textContent = ''
  noteStatus.className = 'note-status'

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(noteForm)).toString()
    })

    if (response.ok) {
      noteStatus.textContent = 'Message sent! Thank you \u2764'
      noteStatus.classList.add('success')
      noteForm.reset()
    } else {
      noteStatus.textContent = 'Something went wrong. Please try again.'
      noteStatus.classList.add('error')
    }
  } catch (err) {
    noteStatus.textContent = 'Network error. Please try again.'
    noteStatus.classList.add('error')
  }

  submitBtn.disabled = false
  submitBtn.textContent = 'Send \u2764'
})
