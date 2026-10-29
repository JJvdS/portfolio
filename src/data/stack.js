// Icons from skillicons.dev (light theme), self-hosted in assets/skills. Ids
// in kFocus are what I'm sharpening right now and get flagged on their tiles
const kIcons = import.meta.glob('../assets/skills/*.svg', {
  eager: true,
  import: 'default',
})

const kNames = {
  cpp: 'C++',
  c: 'C',
  html: 'HTML',
  css: 'CSS',
  sass: 'Sass',
  js: 'JavaScript',
  ts: 'TypeScript',
  react: 'React',
  vue: 'Vue',
  nodejs: 'Node.js',
  ocaml: 'OCaml',
  bash: 'Bash',
  git: 'Git',
  py: 'Python',
  mysql: 'MySQL',
  java: 'Java',
  go: 'Go',
  solidity: 'Solidity',
  swift: 'Swift',
  figma: 'Figma',
  ps: 'Photoshop',
  ae: 'After Effects',
  blender: 'Blender',
  threejs: 'Three.js',
  vscode: 'VS Code',
  eclipse: 'Eclipse',
}

export const kFocus = ['ocaml', 'cpp']

////////////////////////////////////////////////////////////////////////////////
function Icon(id) {
  return kIcons[`../assets/skills/${id}.svg`]
} //Icon

////////////////////////////////////////////////////////////////////////////////
function MakeTier(id, label, caption, level, ids, extra = {}) {
  return {
    id,
    label,
    caption,
    level,
    items: ids.map((key) => ({
      id: key,
      name: kNames[key],
      icon: Icon(key),
      focus: kFocus.includes(key),
    })),
    ...extra,
  }
} //MakeTier

const kStack = [
  MakeTier('proficient', 'Proficient', 'Daily drivers', 5, [
    'cpp', 'c', 'html', 'css', 'sass', 'js', 'ts', 'react', 'vue', 'nodejs',
  ]),
  MakeTier('comfortable', 'Comfortable', 'Reach for them often', 4, [
    'ocaml', 'bash', 'git', 'py', 'mysql',
  ]),
  MakeTier(
    'previously',
    'Previously',
    'Built with, not maintaining',
    3,
    ['java', 'go', 'solidity', 'swift'],
    { faded: true }
  ),
  MakeTier('tools', 'Tools & creative', 'Design, motion & 3D', null, [
    'figma', 'ps', 'ae', 'blender', 'threejs', 'vscode', 'eclipse',
  ]),
]

export const kFocusNames = kFocus.map((key) => kNames[key])
export const kToolCount = kStack.reduce(
  (sum, tier) => sum + tier.items.length,
  0
)

export default kStack
