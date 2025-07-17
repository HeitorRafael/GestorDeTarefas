import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
  useTheme,
  Container,
} from '@mui/material';
import {
  Email,
  LocationOn,
  LinkedIn,
  Code,
  PhoneAndroid,
} from '@mui/icons-material';

function AboutPage() {
  const theme = useTheme();

  const contactInfo = [
    {
      icon: <PhoneAndroid />,
      label: 'Celular',
      value: '(13) 99790-2633',
      href: 'tel:+5513997902633',
      color: '#25D366'
    },
    {
      icon: <Email />,
      label: 'Email',
      value: 'heitorbdelfino@gmail.com',
      href: 'mailto:heitorbdelfino@gmail.com',
      color: '#EA4335'
    },
    {
      icon: <LocationOn />,
      label: 'Localização',
      value: 'Praia Grande, SP',
      href: 'https://maps.google.com/?q=Praia+Grande,SP',
      color: '#4285F4'
    },
    {
      icon: <LinkedIn />,
      label: 'LinkedIn',
      value: 'Heitor Rafael Bezerra Delfino',
      href: 'https://www.linkedin.com/in/heitor-rafael-bezerra-delfino-129760187/',
      color: '#0077B5'
    }
  ];

  const skills = [
    'React.js', 'Node.js', 'JavaScript', 'TypeScript', 'Python',
    'PostgreSQL', 'Material-UI', 'Express.js', 'Git', 'REST APIs',
    'Responsive Design', 'Agile Development'
  ];

  const projects = [
    {
      title: 'MaxiMundi - Sistema de Controle de Tempo',
      description: 'Sistema completo para controle e relatório de tempo com dashboard interativo, filtros avançados e interface responsiva.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Material-UI'],
      features: ['Dashboard com filtros', 'Relatórios em tempo real', 'Controle de usuários', 'Tema escuro/claro']
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          opacity: 0,
          animation: 'fadeInUp 0.6s ease forwards',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 6
          }}
        >
          💼 Sobre o Desenvolvedor
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Seção Principal - Perfil */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(145deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                : `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              },
              opacity: 0,
              animation: 'slideInLeft 0.5s ease 0.2s forwards',
              '@keyframes slideInLeft': {
                from: { opacity: 0, transform: 'translateX(-20px) scale(0.9)' },
                to: { opacity: 1, transform: 'translateX(0) scale(1)' }
              }
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 3,
                fontSize: '3rem',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: theme.shadows[8]
              }}
            >
              👨‍💻
            </Avatar>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Heitor Rafael
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Bezerra Delfino
            </Typography>
            
            <Chip
              icon={<Code />}
              label="Desenvolvedor de Software"
              color="primary"
              variant="outlined"
              sx={{
                fontSize: '1rem',
                py: 2,
                px: 1,
                fontWeight: 'bold',
                border: `2px solid ${theme.palette.primary.main}`,
                '& .MuiChip-icon': {
                  fontSize: '1.2rem'
                }
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "Transformando ideias em soluções digitais inovadoras"
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Seção de Contato */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 4,
              mb: 4,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(145deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                : `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              opacity: 0,
              animation: 'slideInRight 0.5s ease 0.3s forwards',
              '@keyframes slideInRight': {
                from: { opacity: 0, transform: 'translateX(20px)' },
                to: { opacity: 1, transform: 'translateX(0)' }
              }
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'primary.main'
            }}>
              📞 Informações de Contato
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {contactInfo.map((contact, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    component="a"
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8]
                      },
                      border: `1px solid ${contact.color}20`,
                      borderLeft: `4px solid ${contact.color}`,
                      opacity: 0,
                      animation: `fadeInScale 0.4s ease ${0.5 + index * 0.1}s forwards`,
                      '@keyframes fadeInScale': {
                        from: { opacity: 0, transform: 'scale(0.9)' },
                        to: { opacity: 1, transform: 'scale(1)' }
                      }
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton
                        sx={{
                          bgcolor: `${contact.color}15`,
                          color: contact.color,
                          '&:hover': { bgcolor: `${contact.color}25` }
                        }}
                      >
                        {contact.icon}
                      </IconButton>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {contact.label}
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {contact.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Seção de Habilidades */}
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(145deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                : `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              opacity: 0,
              animation: 'slideInRight 0.5s ease 0.4s forwards'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'secondary.main'
            }}>
              🚀 Tecnologias & Habilidades
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={skill}
                  label={skill}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                      color: 'white',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease',
                    opacity: 0,
                    animation: `chipAppear 0.3s ease ${0.5 + index * 0.1}s forwards`,
                    '@keyframes chipAppear': {
                      from: { opacity: 0, transform: 'scale(0)' },
                      to: { opacity: 1, transform: 'scale(1)' }
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Seção de Projetos */}
        <Grid item xs={12}>
          <Card
            elevation={8}
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(145deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                : `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              opacity: 0,
              animation: 'fadeInUp 0.5s ease 0.6s forwards'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main'
              }}>
                🎯 Projeto em Destaque
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              {projects.map((project, index) => (
                <Box key={index}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    {project.title}
                  </Typography>
                  
                  <Typography variant="body1" paragraph color="text.secondary">
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tecnologias:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {project.technologies.map((tech) => (
                        <Chip key={tech} label={tech} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Principais funcionalidades:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {project.features.map((feature) => (
                        <Chip key={feature} label={feature} size="small" color="secondary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      💡 Este é apenas o começo!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      O sistema MaxiMundi que você está utilizando é uma demonstração das minhas habilidades em desenvolvimento full-stack. 
                      Cada funcionalidade foi cuidadosamente projetada para oferecer a melhor experiência do usuário.
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AboutPage;
