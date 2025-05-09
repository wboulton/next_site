import { redirect } from "next/navigation";
interface WriteupProps {
  params: Promise<{ title: string }>;
}
const writeups = [
  { title: 'deadface2024', route: '/DaCube' },
  { title: 'UC2025', route: '/calling_convention' },
  { title: 'umd2025', route: '/cmsc351'}
];

export default async function StoryPage({ params }: WriteupProps) {
  const resolvedParams = await params;
  const story = writeups.find((writeup) => writeup.title === resolvedParams.title);

  if (!story) {
    return <div>404 writeup not found</div>;
  }

  redirect(story.route);
}