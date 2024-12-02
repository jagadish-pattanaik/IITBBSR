export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: (custom) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.3
    }
  })
};

export const cardVariants = {
  hover: {
    scale: 1.03,
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98
  }
};

export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const groupVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2
    }
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};

export const groupHeaderVariants = {
  hover: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.2
    }
  },
  tap: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    scale: 0.98
  }
}; 