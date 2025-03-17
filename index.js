#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const keytar = require('keytar');
const Conf = require('conf');

// Configuration storage
const config = new Conf({
  projectName: 'lethabo-cli'
});

// Service URL - this would be your backend API
const API_URL = 'https://api.yourservice.com'; // Replace with your actual API URL

program
  .version('1.0.0')
  .description('Lethabo CLI - Your awesome command line tool');

// Login command
program
  .command('login')
  .description('Authenticate with Lethabo service')
  .action(async () => {
    const credentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: input => input.includes('@') ? true : 'Please enter a valid email'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*'
      }
    ]);

    try {
      console.log(chalk.blue('Logging in...'));
      
      // This would be your actual authentication endpoint
      // const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // For demonstration purposes
      console.log(chalk.green('Login successful!'));
      
      // Store the token securely
      // await keytar.setPassword('lethabo-cli', credentials.email, response.data.token);
      
      // Store the user email
      config.set('userEmail', credentials.email);
      
      console.log(chalk.green('You are now logged in as ') + chalk.bold(credentials.email));
    } catch (error) {
      console.error(chalk.red('Login failed:'), error.message);
    }
  });

// Logout command  
program
  .command('logout')
  .description('Log out from Lethabo service')
  .action(async () => {
    const userEmail = config.get('userEmail');
    
    if (userEmail) {
      try {
        await keytar.deletePassword('lethabo-cli', userEmail);
        config.delete('userEmail');
        console.log(chalk.green('Successfully logged out!'));
      } catch (error) {
        console.error(chalk.red('Logout failed:'), error.message);
      }
    } else {
      console.log(chalk.yellow('You are not logged in.'));
    }
  });

// Initialize a new project
program
  .command('init [projectName]')
  .description('Initialize a new Lethabo project')
  .action(async (projectName) => {
    // Check if logged in
    const userEmail = config.get('userEmail');
    if (!userEmail) {
      console.log(chalk.yellow('Please login first with: ') + chalk.bold('lethabo login'));
      return;
    }

    if (!projectName) {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Enter project name:',
          default: 'my-lethabo-project'
        }
      ]);
      projectName = response.projectName;
    }

    try {
      console.log(chalk.blue(`Initializing project: ${projectName}...`));
      
      // This would call your API to create a new project
      // const token = await keytar.getPassword('lethabo-cli', userEmail);
      // const response = await axios.post(`${API_URL}/projects`, 
      //   { name: projectName },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // For demonstration
      console.log(chalk.green(`Project ${projectName} created successfully!`));
    } catch (error) {
      console.error(chalk.red('Failed to create project:'), error.message);
    }
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy your project')
  .action(async () => {
    // Check if logged in
    const userEmail = config.get('userEmail');
    if (!userEmail) {
      console.log(chalk.yellow('Please login first with: ') + chalk.bold('lethabo login'));
      return;
    }

    try {
      console.log(chalk.blue('Deploying your project...'));
      
      // Actual implementation would:
      // 1. Package the current directory
      // 2. Upload to your service
      // 3. Return deployment details
      
      // For demonstration
      console.log(chalk.green('Deployment successful!'));
      console.log(`Your project is available at: ${chalk.cyan('https://your-project.lethabo.app')}`);
    } catch (error) {
      console.error(chalk.red('Deployment failed:'), error.message);
    }
  });

program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}