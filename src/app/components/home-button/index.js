import Link from 'next/link';

export default function HomeButton({ text, url, image, subpage, ...props }) {
  return (
    <Link
      href={url}
      target={subpage ? '_self' : '_blank'}
      className="list-group-item list-group-item-action"
      prefetch={false}
      {...props}
    >
      {image && <img src={image} alt={text} width={48} height={48} />}
      {text}
    </Link>
  );
}
