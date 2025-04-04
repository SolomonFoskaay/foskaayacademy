// /app/auth/signup/page.tsx
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import { Metadata } from "next";

// Define fixed metadata values
const title = "Signup Page - Foskaay Academy";
const description = "This is Registration page for Foskaay Academy";
const ogImage = "https://FoskaayAcademy.com/images/opengraph-image.png";
const siteUrl = "https://FoskaayAcademy.com"; // Replace with your actual site URL

// Create metadata object
export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    url: siteUrl,
    type: 'website',
    title: title,
    description: description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: [ogImage],
  },
};

const SignUpPage = ({ searchParams }: { searchParams: { message: string } }) => {
  return (
    <>
    <SignUp searchParams={searchParams} />
    </>
  );
};

export default SignUpPage;
