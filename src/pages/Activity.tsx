import { Clock } from "lucide-react";
import { motion } from "framer-motion";

const Activity = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Timeline of system events</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
          <Clock className="w-10 h-10 text-muted-foreground/25 mb-4" />
          <p className="text-sm text-muted-foreground mb-1">No activity yet</p>
          <p className="text-xs text-muted-foreground/60">Events will appear here as automations run</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Activity;
