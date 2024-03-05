#!/usr/bin/env node

import { program } from 'commander';

import { createGenerateCommand, createRunCommand } from '@/commands';
import { initProgram, initZx } from '@/utils';

initZx();
initProgram();

program.addCommand(createRunCommand(), { isDefault: true });

program.addCommand(createGenerateCommand());

program.parse();
