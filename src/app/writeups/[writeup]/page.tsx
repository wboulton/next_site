import { redirect } from "next/navigation";
interface WriteupProps {
  params: Promise<{ writeup: string }>;
}
const writeups = [
  { writeup: 'deadface2024', route: '/DaCube' },
  { writeup: 'UC2025', route: '/calling_convention' },
  { writeup: 'umd2025', route: '/cmsc351'}
];

export default async function StoryPage({ params }: WriteupProps) {
  const resolvedParams = await params;
  const writeup = writeups.find((writeup) => writeup.writeup === resolvedParams.writeup);

  if (!writeup) {
    return <div>404 writeup not found</div>;
  }

  redirect(writeup.route);
}
