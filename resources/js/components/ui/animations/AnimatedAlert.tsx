import Error from "./Error"
import Info from "./Info"
import Success from "./Success"

export type AlertType =  { status : string , message : string };

export const AnimatedAlert = ({status = 'success' , message = '' } : AlertType) => {
    if(status == 'success'){
        return (
            <div className="my-2">
                <div className="flex justify-center items-center h-54">
                    <Success/>
                </div>
                {message && <h5 className="text-center text-2xl md:text-2xl lg:text-3xl text-gray-800">{message}</h5>}
            </div>
        )
    }else if(status == 'error'){
        return (

            <div className="my-2">
                <div className="flex justify-center items-center h-54">
                    <Error/>
                </div>
                {message && <h5 className="text-center text-2xl md:text-2xl lg:text-3xl text-gray-800">{message}</h5>}
            </div>
        )
    }else{
        return (
            <div className="my-2">
                <div className="flex justify-center items-center h-54">
                    <Info/>
                </div>
                {message && <h5 className="text-center text-2xl md:text-2xl lg:text-3xl text-gray-800">{message}</h5>}
            </div>
        )
    }
}   