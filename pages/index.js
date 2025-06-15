import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>App</title>
      </Head>

      <h1>App with NeonDB</h1>
      <p>View data:</p>
      <Link href="/bulk">Bulk Data</Link><br/>
      <Link href="/single/1">Single Data</Link>
    </div>
  );
}
