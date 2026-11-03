import { experience } from '@/components/experience/experience-data';
import { projects } from '@/components/projects/projects-data';

// ------------------------------------------------------------
// Terminal output model: a line is a list of styled segments.
// ------------------------------------------------------------

export type Tone = 'dim' | 'accent' | 'bright' | 'error';
export type Segment = { text: string; href?: string; tone?: Tone };
export type Line = Segment[];

export type Theme = 'green' | 'amber' | 'white';

export const THEMES: Record<Theme, { color: string; label: string }> = {
  green: { color: '#64ffda', label: 'green phosphor' },
  amber: { color: '#ffb547', label: 'amber phosphor' },
  white: { color: '#e6f1ff', label: 'paper white' },
};

export type Effect =
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'snake' }
  | { type: 'theme'; theme: Theme }
  | { type: 'open'; href: string };

export type CommandResult = { lines: Line[]; effect?: Effect };

export type CommandContext = { history: string[]; theme: Theme };

export const PROMPT = 'guest@gowtham-os:~$';

export const EMAIL = 'contact@gowtham.co.uk';

const SOCIALS = [
  { name: 'github', href: 'https://github.com/gowth6m' },
  { name: 'linkedin', href: 'https://www.linkedin.com/in/gowth6m/' },
  { name: 'x', href: 'https://x.com/gowth6m' },
  { name: 'instagram', href: 'https://www.instagram.com/gowth6m/' },
  { name: 'codepen', href: 'https://codepen.io/Gowth6m' },
];

const FILES: Record<string, () => Line[]> = {
  'about.txt': () => about(),
  'contact.txt': () => contact(),
  'secret.txt': () => [
    txt('There is no secret here.'),
    txt('...but have you tried `snake`?', 'dim'),
  ],
};

// ------------------------------------------------------------

const txt = (text: string, tone?: Tone): Line => [{ text, tone }];
const blank: Line = [{ text: '' }];

const shownExperience = () => experience.filter((e) => e.display);
const shownProjects = () => projects.filter((p) => p.display);

const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

function about(): Line[] {
  return [
    txt('Gowthaman Ravindrathas', 'bright'),
    txt('Co-Founder & CTO at Wavelink. Software engineer based in London, UK.'),
    blank,
    txt(
      "I've built products across startups, scale-ups and larger organisations, working end-to-end on frontend and backend systems."
    ),
    blank,
    txt(
      'Right now: building Wavelink, plus AI-powered products and polished web experiences with a focus on performance, clean architecture and UX.'
    ),
    blank,
    txt('Off the clock: lifting, exploring new places, hunting for great food.', 'dim'),
  ];
}

function contact(): Line[] {
  return [
    [
      { text: 'email     ', tone: 'dim' },
      { text: EMAIL, href: `mailto:${EMAIL}` },
    ],
    ...SOCIALS.map<Line>((s) => [
      { text: pad(s.name, 10), tone: 'dim' },
      { text: s.href.replace(/^https:\/\/(www\.)?/, ''), href: s.href },
    ]),
  ];
}

function topSkills(limit: number): string[] {
  const counts = new Map<string, number>();
  for (const e of shownExperience()) {
    for (const t of e.technologies) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  for (const p of shownProjects()) {
    for (const t of p.stack) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    if ((line + ' ' + word).trim().length > width) {
      if (line) out.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) out.push(line);
  return out;
}

function findProject(arg: string) {
  const list = shownProjects();
  const n = Number(arg);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return list[n - 1];
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const q = norm(arg);
  return q ? list.find((p) => norm(p.title).includes(q)) : undefined;
}

const NEOFETCH_ART = [
  ' .-----------. ',
  ' | .-------. | ',
  ' | | >_    | | ',
  ' | |       | | ',
  " | '-------' | ",
  " '----___----' ",
  '   [=======]   ',
  '               ',
];

// ------------------------------------------------------------

type Handler = (args: string[], ctx: CommandContext) => CommandResult;

type CommandSpec = { usage?: string; desc: string; hidden?: boolean; run: Handler };

const COMMANDS: Record<string, CommandSpec> = {
  help: {
    desc: 'list commands',
    run: () => {
      const visible = Object.entries(COMMANDS).filter(([, c]) => !c.hidden);
      return {
        lines: [
          txt('Available commands:', 'bright'),
          ...visible.map<Line>(([name, c]) => [
            { text: '  ' + pad(c.usage ?? name, 18), tone: 'accent' },
            { text: c.desc, tone: 'dim' },
          ]),
          blank,
          txt('Tip: Tab completes, ↑/↓ walks history, Esc powers off.', 'dim'),
        ],
      };
    },
  },
  about: { desc: 'who is Gowtham?', run: () => ({ lines: about() }) },
  experience: {
    usage: 'experience [n]',
    desc: 'where I have worked',
    run: (args) => {
      const list = shownExperience();
      if (args[0]) {
        const e = list[Number(args[0]) - 1];
        if (!e)
          return { lines: [txt(`experience: no entry ${args[0]} (1-${list.length})`, 'error')] };
        return {
          lines: [
            [
              { text: `${e.role} · `, tone: 'bright' },
              { text: e.company, href: e.link, tone: 'bright' },
            ],
            txt(e.dates.toUpperCase(), 'dim'),
            blank,
            ...wrap(e.description, 68).map((l) => txt(l)),
            ...e.descriptions.flatMap((d) => wrap(d, 66).map((l, i) => txt((i ? '  ' : '- ') + l))),
            blank,
            txt('stack: ' + e.technologies.join(', '), 'accent'),
          ],
        };
      }
      return {
        lines: [
          ...list.map<Line>((e, i) => [
            { text: `[${i + 1}] `, tone: 'accent' },
            { text: pad(e.dates, 21), tone: 'dim' },
            { text: `${e.role} · ${e.company}` },
          ]),
          blank,
          txt('Run `experience <n>` for details.', 'dim'),
        ],
      };
    },
  },
  projects: {
    desc: 'things I have built',
    run: () => ({
      lines: [
        ...shownProjects().map<Line>((p, i) => [
          { text: `[${i + 1}] `, tone: 'accent' },
          { text: `${p.year}  `, tone: 'dim' },
          p.link ? { text: p.title, href: p.link } : { text: p.title },
          {
            text:
              ' - ' +
              (p.description.length > 52
                ? p.description.slice(0, 50).trimEnd() + '…'
                : p.description),
            tone: 'dim',
          },
        ]),
        blank,
        txt('Run `open <n>` to launch one.', 'dim'),
      ],
    }),
  },
  open: {
    usage: 'open <n|name>',
    desc: 'open a project in a new tab',
    run: (args) => {
      if (!args.length) return { lines: [txt('usage: open <n|name>', 'error')] };
      const arg = args.join(' ');
      const social = SOCIALS.find((s) => s.name === arg.toLowerCase());
      const href = social?.href ?? findProject(arg)?.link ?? findProject(arg)?.github;
      if (!href) return { lines: [txt(`open: can't find "${arg}". Try \`projects\`.`, 'error')] };
      return {
        lines: [
          [
            { text: 'launching ', tone: 'dim' },
            { text: href, href },
          ],
        ],
        effect: { type: 'open', href },
      };
    },
  },
  skills: {
    desc: 'tools I reach for most',
    run: () => {
      const skills = topSkills(18);
      const rows: Line[] = [];
      for (let i = 0; i < skills.length; i += 3) {
        rows.push(
          txt(
            '  ' +
              skills
                .slice(i, i + 3)
                .map((s) => pad(s, 20))
                .join('')
          )
        );
      }
      return { lines: [txt('Most used across my work and projects:', 'bright'), ...rows] };
    },
  },
  contact: { desc: 'get in touch', run: () => ({ lines: contact() }) },
  neofetch: {
    desc: 'system info',
    run: (_args, ctx) => {
      const current = shownExperience()[0];
      const info: Line[] = [
        [{ text: 'guest', tone: 'accent' }, { text: '@' }, { text: 'gowtham-os', tone: 'accent' }],
        txt('----------------'),
        [{ text: 'OS      ', tone: 'accent' }, { text: 'GowthamOS 2.0 (retro)' }],
        [{ text: 'Host    ', tone: 'accent' }, { text: 'London, UK' }],
        [
          { text: 'Role    ', tone: 'accent' },
          { text: current ? `${current.role} @ ${current.company}` : 'Engineer' },
        ],
        [{ text: 'Shell   ', tone: 'accent' }, { text: 'gsh 1.0' }],
        [{ text: 'Stack   ', tone: 'accent' }, { text: topSkills(4).join(', ') }],
        [{ text: 'Theme   ', tone: 'accent' }, { text: THEMES[ctx.theme].label }],
      ];
      return {
        lines: NEOFETCH_ART.map<Line>((art, i) => [
          { text: art + '  ', tone: 'accent' },
          ...(info[i] ?? []),
        ]),
      };
    },
  },
  ls: {
    desc: 'list files',
    run: () => ({
      lines: [
        [
          ...Object.keys(FILES).map<Segment>((f) => ({ text: f + '  ' })),
          { text: 'experience/  projects/', tone: 'accent' },
        ],
      ],
    }),
  },
  cat: {
    usage: 'cat <file>',
    desc: 'read a file',
    run: (args) => {
      const f = args[0];
      if (!f) return { lines: [txt('usage: cat <file>', 'error')] };
      if (FILES[f]) return { lines: FILES[f]() };
      if (f.replace(/\/$/, '') === 'experience' || f.replace(/\/$/, '') === 'projects') {
        return {
          lines: [txt(`cat: ${f}: Is a directory. Try \`${f.replace(/\/$/, '')}\`.`, 'error')],
        };
      }
      return { lines: [txt(`cat: ${f}: No such file`, 'error')] };
    },
  },
  theme: {
    usage: 'theme <name>',
    desc: 'green | amber | white',
    run: (args) => {
      const t = args[0] as Theme;
      if (!t || !THEMES[t]) {
        return { lines: [txt(`usage: theme ${Object.keys(THEMES).join(' | ')}`, 'error')] };
      }
      return {
        lines: [txt(`Switched to ${THEMES[t].label}.`)],
        effect: { type: 'theme', theme: t },
      };
    },
  },
  snake: { desc: 'play a quick game', run: () => ({ lines: [], effect: { type: 'snake' } }) },
  history: {
    desc: 'previous commands',
    run: (_args, ctx) => ({
      lines: ctx.history.length
        ? ctx.history.map((h, i) => txt(`${String(i + 1).padStart(4)}  ${h}`))
        : [txt('(empty)', 'dim')],
    }),
  },
  clear: { desc: 'clear the screen', run: () => ({ lines: [], effect: { type: 'clear' } }) },
  exit: { desc: 'power off', run: () => ({ lines: [], effect: { type: 'exit' } }) },

  // --- hidden -------------------------------------------------
  whoami: {
    desc: '',
    hidden: true,
    run: () => ({ lines: [txt('guest. But you can call me whatever you like.')] }),
  },
  pwd: { desc: '', hidden: true, run: () => ({ lines: [txt('/home/gowtham')] }) },
  cd: {
    desc: '',
    hidden: true,
    run: () => ({ lines: [txt("There's nowhere else to go. You're already home.")] }),
  },
  date: { desc: '', hidden: true, run: () => ({ lines: [txt(new Date().toString())] }) },
  echo: { desc: '', hidden: true, run: (args) => ({ lines: [txt(args.join(' '))] }) },
  sudo: {
    desc: '',
    hidden: true,
    run: () => ({
      lines: [txt('guest is not in the sudoers file. This incident will be reported.', 'error')],
    }),
  },
  rm: {
    desc: '',
    hidden: true,
    run: () => ({
      lines: [txt('Nice try. Everything here is read-only (and backed up).', 'error')],
    }),
  },
  vim: {
    desc: '',
    hidden: true,
    run: () => ({ lines: [txt('You are now trapped in vim. Just kidding. Type `exit`.')] }),
  },
  hire: {
    desc: '',
    hidden: true,
    run: () => ({
      lines: [
        [{ text: 'Great idea. Drop me a line at ' }, { text: EMAIL, href: `mailto:${EMAIL}` }],
      ],
    }),
  },
  hello: {
    desc: '',
    hidden: true,
    run: () => ({ lines: [txt('Hey! Type `help` to look around.')] }),
  },
  quit: { desc: '', hidden: true, run: () => ({ lines: [], effect: { type: 'exit' } }) },
};

COMMANDS.hi = COMMANDS.hello;

// ------------------------------------------------------------

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [rawName, ...args] = input.trim().split(/\s+/);
  const name = (rawName ?? '').toLowerCase();
  if (!name) return { lines: [] };
  const cmd = COMMANDS[name];
  if (!cmd) {
    return {
      lines: [
        txt(`gsh: command not found: ${rawName}. Type \`help\` to see what I can do.`, 'error'),
      ],
    };
  }
  return cmd.run(args, ctx);
}

export function complete(partial: string): string[] {
  const parts = partial.trimStart().split(/\s+/);
  if (parts.length <= 1) {
    const p = (parts[0] ?? '').toLowerCase();
    return Object.entries(COMMANDS)
      .filter(([n, c]) => !c.hidden && n.startsWith(p))
      .map(([n]) => n);
  }
  const [cmd, arg = ''] = parts;
  const pool =
    cmd === 'cat'
      ? Object.keys(FILES)
      : cmd === 'theme'
        ? Object.keys(THEMES)
        : cmd === 'open'
          ? [
              ...SOCIALS.map((s) => s.name),
              ...shownProjects().map((p) => p.title.toLowerCase().replace(/\s+/g, '-')),
            ]
          : [];
  return pool.filter((o) => o.startsWith(arg.toLowerCase())).map((o) => `${cmd} ${o}`);
}

export const WELCOME: Line[] = [
  txt('GowthamOS 2.0  ·  640K RAM OK  ·  portfolio.sys loaded', 'dim'),
  blank,
  txt("Hi, I'm Gowtham. Welcome to my computer.", 'bright'),
  txt('Type `help` to see what it can do, or tap a command below.'),
];

export const lineText = (l: Line) => l.map((s) => s.text).join('');
