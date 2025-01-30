import React from 'react';
import { useImagePreviewerStore } from './image-previewer-store'; // Assuming the Zustand store is in a file called store.ts
import ReactDOM from 'react-dom';
import { XIcon } from 'lucide-react';

const ImagePreviewer: React.FC = () => {
    const { selectedImage, setSelectedImage } = useImagePreviewerStore();
    if (!selectedImage) return null;

    const closePreviewer = () => {
        setSelectedImage(null);
    };

    // Ensure the target element exists
    const portalRoot = document.getElementById("app") || document.body;

    return ReactDOM.createPortal(
        <div className="fixed w-screen inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={{ zIndex: 9999 }}>
            <div className="relative max-w-full max-h-full">
                <div className='bg-white rounded-lg p-6'>
                    <img
                        src={selectedImage}
                        alt="Selected"
                        className="object-contain max-w-[90vw] max-h-[90vh] border-4 border-white"
                    />
                </div>
                <button
                    className="absolute top-2 right-1 p-2 text-gray-700 bg-slate-200 rounded-full"
                    onClick={closePreviewer}
                    style={{ zIndex: 9999 }}
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
        </div>,
        portalRoot // Render the portal at the element, falling back to document.body
    );
};

export default ImagePreviewer;
