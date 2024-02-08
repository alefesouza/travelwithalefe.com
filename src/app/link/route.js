import { redirect } from 'next/navigation';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (
    url &&
    (url.includes('web+viajarcomale://') ||
      url.includes('web+travelwithalefe://') ||
      url.includes('web+vca://'))
  ) {
    redirect(
      url
        .replace('web+viajarcomale:/', '')
        .replace('web+travelwithalefe:/', '')
        .replace('web+vca:/', '')
    );
  }

  redirect('/');
}
