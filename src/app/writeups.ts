export type Writeup = {
  slug: string;
  route: string;
  title: string;
  event: string;
  category: string;
};

export const writeups: Writeup[] = [
  {
    slug: 'DaCube',
    route: '/DaCube',
    title: 'DaCube',
    event: 'DeadFace CTF 2024',
    category: 'Crypto',
  },
  {
    slug: 'calling_convention',
    route: '/calling_convention',
    title: 'Calling Convention',
    event: 'Bearcat World Tour 2025',
    category: 'Pwn',
  },
  {
    slug: 'cmsc351',
    route: '/cmsc351',
    title: 'cmsc351',
    event: 'UMDCTF 2025',
    category: 'Reverse Engineering',
  },
];
