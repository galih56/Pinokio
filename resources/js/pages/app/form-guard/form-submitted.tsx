"use client"

import { ThankYouPage } from "@/features/form-guard/components/thank-you-page"
import { useNavigate } from "react-router-dom";


export const FormSubmittedRoute = () => {
    const navigate = useNavigate()
    return (
        <div className="max-w-2xl mx-auto">
            <ThankYouPage onBack={() => navigate(-1)}/>
        </div>
    );
};