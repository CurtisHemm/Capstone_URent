import { useEffect, useState } from "react";

export default function Home() {

  useEffect(() => {
    console.log("hello")
  }, []);

  return (
    <h1>URent is a matching application. URent has either a Tenant looking for a listing, or a landlord looking for a possible Tenant.
      Sign up and give your preferences, or listings, and start matching.
    </h1>
  );
}