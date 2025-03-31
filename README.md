# Page Replacement Algorithm Simulator

An interactive educational tool for visualizing and comparing different page replacement algorithms used in operating systems memory management.

  

## Overview

This simulator demonstrates how different page replacement algorithms work in operating systems by visualizing the process of page faults and hits. It's designed as an educational tool to help students and professionals understand the trade-offs between different page replacement strategies.

  

## Features

- **Interactive Visualization**: Step-by-step simulation of page replacement processes

- **Multiple Algorithms**: Implements FIFO, LRU, Optimal, and Clock (Second Chance) algorithms

- **Customizable Parameters**: Adjust reference string and number of memory frames

- **Performance Statistics**: Compare hit/fault ratios across different algorithms

- **Playback Controls**: Play, pause, step forward/backward, and reset the simulation

- **Speed Control**: Adjust the playback speed to visualize at different rates

- **Visual Indicators**: Color-coded frames to highlight hits, faults, and replacements

- **Dark Mode Support**: Comfortable viewing in different lighting conditions

- **Responsive Design**: Works on desktop and mobile devices

  

## Algorithms Explained

### FIFO (First-In-First-Out)

- Replaces the page that has been in memory the longest

- Simple to implement but doesn't consider page usage frequency

- Can suffer from Belady's anomaly (increasing frames can increase page faults)

  
### LRU (Least Recently Used)

- Replaces the page that hasn't been accessed for the longest time

- Better performance than FIFO but requires tracking access history

- More complex to implement in hardware


### OPT (Optimal Page Replacement)

- Replaces the page that won't be used for the longest time in the future

- Theoretical best performance (lowest page fault rate)

- Not implementable in practice as it requires future knowledge

- Used as a benchmark to compare other algorithms

  
### Clock Algorithm (Second Chance)

- Approximates LRU with lower overhead

- Uses a circular queue with reference bits

- When a page is accessed, its reference bit is set to 1

- When replacement is needed, pages with reference bit 0 are replaced

- If reference bit is 1, it's set to 0 and the algorithm moves to the next page

  
## Installation

This project is built with Next.js and can be installed using npm:

```bash

# Clone the repository

git clone https://github.com/MohakGrover/Efficient-Page-replacement-algorithm-simulator

  

# Navigate to the project directory

cd page-replacement-simulator

  

# Install dependencies

npm install

  

# Start the development server

npm run dev
```
