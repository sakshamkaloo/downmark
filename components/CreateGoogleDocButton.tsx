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
}