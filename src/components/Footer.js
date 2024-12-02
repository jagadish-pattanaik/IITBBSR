import { Box, Container, Grid, Typography, IconButton, Stack } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com' },
    { icon: <Twitter />, url: 'https://twitter.com' },
    { icon: <LinkedIn />, url: 'https://linkedin.com' },
    { icon: <Instagram />, url: 'https://instagram.com' },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box
                component="img"
                src="/logo1.png"
                alt="Logo 1"
                sx={{ height: 40 }}
              />
              <Box
                component="img"
                src="/logo2.png"
                alt="Logo 2"
                sx={{ height: 40 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Empowering students with the skills they need to succeed in the digital world.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} justifyContent="center">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconButton
                    color="primary"
                    onClick={() => window.open(social.url, '_blank')}
                  >
                    {social.icon}
                  </IconButton>
                </motion.div>
              ))}
            </Stack>
          </Grid>
        </Grid>
        
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} Progresso. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 