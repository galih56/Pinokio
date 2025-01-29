import { formatDateTime } from "@/lib/datetime";
import { File } from "@/types/api";
import { TrashIcon , DownloadIcon} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useImagePreviewerStore } from "@/components/ui/image-previewer";

export type FilesListProps = {
  data : File[]
};

export const FileList = ({
    data,
}: FilesListProps) => {
    const { setSelectedImage } = useImagePreviewerStore()
    
    if(!Array.isArray(data)) return null;
    
    return (
        <div className="flex flex-col bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 border-md border-spacing-2">
            {data?.map(file => {
                return (
                    <div className="m-2 p-2 border-slate-400 bg-white rounded-lg flex shadow-sm" key={file.id}>
                        <div className="items-start">
                            <a className="text-sm" 
                                onClick={(e)=> {
                                    e.preventDefault();
                                    setSelectedImage(file.url)
                                }}
                                href={file.url}>{file.name}</a>
                            <div className="text-xs text-gray-400">Uploaded At : {formatDateTime(file.uploadedAt)}</div>
                        </div>
                        <div className="flex-1 text-right">
                            <a href={file.url} download className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 p-4 bg-white rounded-xl">
                                <DownloadIcon className="text-blue-400 h-6"/>
                            </a>
                            {/* <Button type="button" variant={"outline"} className="border-none">
                                <TrashIcon className="text-red-400 h-6"/>
                            </Button> */}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
