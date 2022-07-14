import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import { getZapdosAuthSession } from "../server/common/get-server-session";

import { FaEye, FaEyeSlash, FaCopy, FaSignOutAlt } from "react-icons/fa";

const copyUrlToClipboard = (path: string) => () => {
  if (!process.browser) return;
  navigator.clipboard.writeText(`${window.location.origin}${path}`);
};

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: sesh } = useSession();
  const { mutate: unpinQuestion } = trpc.proxy.questions.unpin.useMutation();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => unpinQuestion()}
        className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
      >
        Hide Current Q <FaEyeSlash size={24} />
      </button>
      <button
        onClick={copyUrlToClipboard(`/embed/${userId}`)}
        className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
      >
        Copy embed url <FaCopy size={24} />
      </button>
      <button
        onClick={copyUrlToClipboard(`/ask/${sesh?.user?.name?.toLowerCase()}`)}
        className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
      >
        Copy Q&A url <FaCopy size={24} />
      </button>
      <button
        onClick={() => signOut()}
        className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
      >
        Logout <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

const QuestionsView = () => {
  const { data, isLoading } = trpc.proxy.questions.getAll.useQuery();

  const { mutate: pinQuestion } = trpc.proxy.questions.pin.useMutation();

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-4 animate-fade-in-down">
      {data?.map((q) => (
        <div
          key={q.id}
          className="p-4 bg-gray-600 rounded flex justify-between"
        >
          {q.body}
          <button onClick={() => pinQuestion({ questionId: q.id })}>
            <FaEye size={24} />
          </button>
        </div>
      ))}
    </div>
  );
};

const HomeContents = () => {
  const { data } = useSession();

  if (!data)
    return (
      <div>
        <div>Please log in</div>
        <button onClick={() => signIn("twitch")}>Sign in with Twitch</button>
      </div>
    );

  return (
    <div className="flex flex-col p-8">
      <div className="flex justify-between w-full items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {data.user?.image && (
            <img
              src={data.user?.image}
              alt="pro pic"
              className="rounded-full w-24"
            />
          )}
          {data.user?.name}
        </h1>
        <NavButtons userId={data.user?.id!} />
      </div>
      <div className="p-4" />
      <QuestionsView />
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Stream Q&A Tool</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HomeContents />
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getZapdosAuthSession(ctx),
    },
  };
};

export default Home;
