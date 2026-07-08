import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import PageTransition from "../components/ui/PageTransition";

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="not-found container">
        <h1 className="page-title">404</h1>
        <p className="page-lead">Page not found · 页面未找到</p>
        <Button as={Link} to="/">Back Home</Button>
      </div>
    </PageTransition>
  );
}
