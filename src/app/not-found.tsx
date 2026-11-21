import StoreLayout from "./(store)/layout";
import { NotFoundContent } from "@/components/common/not-found-content";

/** Unmatched URLs: render the 404 inside the storefront chrome. */
export default function NotFound() {
  return (
    <StoreLayout>
      <NotFoundContent />
    </StoreLayout>
  );
}
