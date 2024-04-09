import axios from "axios";
//import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

export function Posts() {
  async function posts2wp() {
    const { data } = await axios.get("/api/posts2wp");
    //console.log("🚀 ~ posts2wp ~ data:", data);
  }

  return (
    <div className="mb-6">
      <Button className="mr-6" onClick={posts2wp}>
        GET /posts2wp
      </Button>
    </div>
  );
}
