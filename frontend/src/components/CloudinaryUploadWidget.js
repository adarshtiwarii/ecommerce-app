// src/components/CloudinaryUploadWidget.js
import React, { useEffect, useRef, useState } from 'react';

const CloudinaryUploadWidget = ({ onUpload, buttonText = "Upload Images", multiple = true }) => {
    const cloudName = "dhc5jt9q2";
    const uploadPreset = "ecommerce_uploads";
    const widgetRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!window.cloudinary) {
            const script = document.createElement('script');
            script.src = 'https://upload-widget.cloudinary.com/global/all.js';
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            document.body.appendChild(script);
        } else {
            setScriptLoaded(true);
        }
    }, []);

    const openWidget = () => {
        if (!window.cloudinary || !scriptLoaded) {
            console.error('Cloudinary script not loaded yet');
            return;
        }
        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                multiple: multiple,
                folder: 'ecommerce_products',
                tags: ['product'],
                clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp', 'svg'],
                maxFileSize: 5000000,          // 5 MB
                showPoweredBy: false,
                cropping: false,
                styles: {
                    palette: {
                        window: '#FFFFFF',
                        windowBorder: '#FED7AA',
                        tabIcon: '#F97316',
                        menuIcons: '#F97316',
                        textDark: '#111827',
                        textLight: '#6B7280',
                        link: '#EA580C',
                        action: '#F97316',
                        inactiveTabIcon: '#9CA3AF',
                        error: '#F44235',
                        inProgress: '#F97316',
                        complete: '#20B832',
                        sourceBg: '#FFF7ED'
                    }
                }
            },
            (error, result) => {
                if (result && result.event === "success") {
                    const imageUrl = result.info.secure_url;
                    onUpload(imageUrl);
                }
            }
        );
        widget.open();
        widgetRef.current = widget;
    };

    return (
        <button
            type="button"
            onClick={openWidget}
            disabled={!scriptLoaded}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {buttonText}
        </button>
    );
};

export default CloudinaryUploadWidget;
