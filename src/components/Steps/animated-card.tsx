import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const AnimatedCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="w-full shadow-sm border border-gray-200 hover:shadow-md transition-all rounded-xl bg-white">
      {children}
    </Card>
  </motion.div>
);

export default AnimatedCard;
