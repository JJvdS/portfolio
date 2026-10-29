import { useEffect, useState } from 'react'
import '../styles/Background.sass'

const kColorThemes = [
  ['#FC8E00', '#798A9A', '#E6BD69', '#254562', '#F60000'],
  ['#D9B800', '#ADB9C1', '#D6CC98', '#00709E', '#D90000'],
  ['#267AD9', '#86786B', '#335497', '#C5A993', '#26D9D9'],
  ['#FFD19C', '#C9DDEF', '#FFD681', '#BCE1FF', '#FFC9C9'],
  ['#9D9D9D', '#868686', '#C1C1C1', '#3C3C3C', '#4C4C4C'],
]

const kEnterDelay = 250
const kReadyDelay = 2000
const kThemeInterval = 15000

const kPathOutTop =
  'M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,' +
  '52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z'
const kPathInTop =
  'M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50' +
  'S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z'
const kPathOutBottom =
  'M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1' +
  's63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,' +
  '105.9,48.6Z'
const kPathInBottom =
  'M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8' +
  's35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z'

////////////////////////////////////////////////////////////////////////////////
function Background() {
  const [theme_index, SetThemeIndex] = useState(0)
  const [positioned, SetPositioned] = useState(false)
  const [ready, SetReady] = useState(false)

  // Hidden tabs still tick but never paint, so the theme would jump on
  // return; the interval is paused while the tab is hidden
  useEffect(() => {
    const enter_timer = setTimeout(() => {
      SetPositioned(true)
      SetThemeIndex(Math.floor(Math.random() * 4))
    }, kEnterDelay)

    let interval_id = setInterval(AdvanceTheme, kThemeInterval)

    function AdvanceTheme() {
      SetThemeIndex((index) => (index + 1) % kColorThemes.length)
    } //AdvanceTheme

    function HandleVisibilityChange() {
      if (document.hidden) {
        clearInterval(interval_id)
      } else {
        interval_id = setInterval(AdvanceTheme, kThemeInterval)
      }
    } //HandleVisibilityChange

    document.addEventListener('visibilitychange', HandleVisibilityChange)

    return () => {
      clearTimeout(enter_timer)
      clearInterval(interval_id)
      document.removeEventListener('visibilitychange', HandleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!positioned) return

    const ready_timer = setTimeout(() => SetReady(true), kReadyDelay)
    return () => clearTimeout(ready_timer)
  }, [positioned])

  const [out_top, in_top, out_bottom, in_bottom, container_color] =
    kColorThemes[theme_index]

  return (
    <div className="background-layer">
      <div
        className={`background${ready ? ' ready' : ''}`}
        style={{ backgroundColor: container_color }}
      >
        <svg
          className={`svgTop${positioned ? ' positioned' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 100 100"
        >
          <path className="out-top" fill={out_top} d={kPathOutTop} />
          <path className="in-top" fill={in_top} d={kPathInTop} />
        </svg>
        <svg
          className={`svgBottom${positioned ? ' positioned' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 100 100"
        >
          <path className="out-bottom" fill={out_bottom} d={kPathOutBottom} />
          <path className="in-bottom" fill={in_bottom} d={kPathInBottom} />
        </svg>
      </div>
    </div>
  )
} //Background

export default Background
