<<<<<<< HEAD
"use client";

type Props = {
  onClick: () => void;
  loading: boolean;
};

export default function CreateGoogleDocButton({
  onClick,
  loading,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create Google Doc"}
    </button>
  );
=======
"use client";

type Props = {
  onClick: () => void;
  loading: boolean;
};

export default function CreateGoogleDocButton({
  onClick,
  loading,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create Google Doc"}
    </button>
  );
>>>>>>> a80a3d9a6dbcde1b8989994703b70fca48145266
}