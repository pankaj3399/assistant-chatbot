import { ChevronDown, ChevronRight, Clipboard } from "lucide-react";
import { useState } from "react";

const ChatBox = ({pdfText, response, name, date}:{
    pdfText: string,
    response: string,
    name: string,
    date: string
}) => {


  const [isPdftextVisible, setIsPdfTextVisible] = useState(false)

  return (
    <div className=" flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 flex flex-col gap-3">
            {
                name && date && (
                    <div className=" items-center">
                        <p className="font-bold text-xl">{name}</p>
                        <p className="text-sm text-gray-500">{new Date(Number(date)).toDateString()}</p>
                    </div>
                )
            }
          {pdfText && (
            <div className="bg-blue-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
                <div className="flex gap-1 items-center">
                    <h1 className="text-blue-500 font-bold">PDF Content:</h1>
                    <button className="text-blue-500" onClick={()=> setIsPdfTextVisible(!isPdftextVisible)}>{!isPdftextVisible ? <ChevronRight />:<ChevronDown />}</button>
                </div>
                {
                    isPdftextVisible && (
                        <p>
                            {pdfText}
                        </p>
                    )
                }
            </div>
          )}
        
          {response && (
            <div className="bg-orange-200/70 border border-blue-500 p-3 rounded-md text-justify font-inter ">
              <h5 className="text-orange-500 font-bold flex justify-between">
                ReportWise Assistant:{" "}
              </h5>
              <pre className="text-wrap font-inter">{response}</pre>
              <button
                className="w-5 h-5 block text-orange-500 mt-3"
                onClick={() => {
                  window.navigator.clipboard.writeText(response);
                }}
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
