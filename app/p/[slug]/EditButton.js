"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";

export default function EditButton({ ownerId, shortCode }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (active && data?.user?.id === ownerId) {
        setIsOwner(true);
      }
    });
    return () => {
      active = false;
    };
  }, [ownerId]);

  if (!isOwner || !shortCode) return null;

  return (
    <a href={`/builder.html?code=${shortCode}`} className="editBtn">
      Edit profile
    </a>
  );
}