import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <AiOutlineLoading3Quarters className="size-10 animate-spin" />
    </div>
  );
};

export default Loading;