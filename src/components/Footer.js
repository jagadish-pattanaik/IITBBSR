import { Box, Container, Grid, Typography, IconButton, Stack, Link, Divider } from '@mui/material';
import { GitHub, LinkedIn, Twitter, Instagram, Email, Phone } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  position: 'relative',
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& img': {
    height: 40,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
}));

const Footer = () => {
  const socialLinks = [
    { icon: <GitHub />, url: 'https://github.com', label: 'GitHub' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram />, url: 'https://instagram.com', label: 'Instagram' },
  ];

  const quickLinks = [
    { text: 'About Us', href: '/about' },
    { text: 'Contact', href: '/contact' },
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Terms of Service', href: '/terms' },
  ];

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LogoContainer>
                <Box
                  component="img"
                  src="/logo1.png"
                  alt="Logo 1"
                />
                <Box
                  component="img"
                  src="/logo2.png"
                  alt="Logo 2"
                />
              </LogoContainer>
              <Typography variant="body2" color="text.secondary" paragraph>
                Empowering students with the skills they need to succeed in the digital world.
                Join our community and start your learning journey today.
              </Typography>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FooterLink href={link.href}>
                    {link.text}
                  </FooterLink>
                </motion.div>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  support@AcademIX.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  +1 234 567 890
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SocialButton
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </SocialButton>
                  </motion.div>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          © {new Date().getFullYear()} AcademIX. All rights reserved.
        </Typography>
      </Container>
    </StyledFooter>
  );
};

export default Footer; 