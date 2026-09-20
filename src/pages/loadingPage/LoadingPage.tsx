import { FC } from "react";
import loadingGif from "@/assets/loading.gif";

interface LoadingPageProps {
    message?: string;
}
const LoadingPage: FC<LoadingPageProps> = ({message = "Laddar..."}) => {
    return (
        <div className="page">
            <img src={loadingGif} alt="Loading" height={40}/>
            <p>{message}</p>
        </div>
    );
};

export default LoadingPage;
