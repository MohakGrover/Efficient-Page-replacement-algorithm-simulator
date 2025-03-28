"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"

// Update the Algorithm type to include "clock"
type Algorithm = "fifo" | "lru" | "optimal" | "clock"

interface PageFrame {
  page: number | null
  lastUsed: number
  loadedAt: number
}

// Add this interface for the Clock algorithm after the PageFrame interface
interface ClockFrame extends PageFrame {
  referenceBit: boolean
}

interface SimulationStep {
  reference: number
  frames: PageFrame[]
  fault: boolean
  replaced?: number
  algorithm: Algorithm
  clockHand?: number
}

// Initialize state variables with default values
const defaultAlgorithm: Algorithm = "fifo"
const defaultReferenceString = "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1"
const defaultFrameCount = 3
const defaultParsedReferences: number[] = []
const defaultSimulationSteps: SimulationStep[] = []
const defaultCurrentStep = -1
const defaultIsPlaying = false
const defaultPlaybackSpeed = 1

// Update the statistics state to include clock
const defaultStatistics = {
  fifo: { faults: 0, hits: 0 },
  lru: { faults: 0, hits: 0 },
  optimal: { faults: 0, hits: 0 },
  clock: { faults: 0, hits: 0 },
}

const PageReplacementSimulator = () => {
  const [algorithm, setAlgorithm] = useState<Algorithm>(defaultAlgorithm)
  const [referenceString, setReferenceString] = useState(defaultReferenceString)
  const [frameCount, setFrameCount] = useState(defaultFrameCount)
  const [parsedReferences, setParsedReferences] = useState<number[]>(defaultParsedReferences)
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>(defaultSimulationSteps)
  const [currentStep, setCurrentStep] = useState(defaultCurrentStep)
  const [isPlaying, setIsPlaying] = useState(defaultIsPlaying)
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultPlaybackSpeed)

  // Update the statistics state to include clock
  const [statistics, setStatistics] = useState(defaultStatistics)

  // Parse reference string
  useEffect(() => {
    try {
      const parsed = referenceString
        .split(",")
        .map((s) => Number.parseInt(s.trim()))
        .filter((n) => !isNaN(n))
      setParsedReferences(parsed)
    } catch (e) {
      setParsedReferences([])
    }
  }, [referenceString])

  // Run simulation when parameters change
  useEffect(() => {
    if (parsedReferences.length > 0 && frameCount > 0) {
      runSimulation()
    }
  }, [parsedReferences, frameCount, algorithm])

  // Playback control
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPlaying && currentStep < simulationSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1000 / playbackSpeed)
    } else if (currentStep >= simulationSteps.length - 1) {
      setIsPlaying(false)
    }

    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, simulationSteps.length, playbackSpeed])

  // Add this function after the simulateOptimal function
  const simulateClock = (references: number[], frames: number): SimulationStep[] => {
    const steps: SimulationStep[] = []
    const pageFrames: ClockFrame[] = Array(frames)
      .fill(null)
      .map(() => ({
        page: null,
        lastUsed: 0,
        loadedAt: 0,
        referenceBit: false,
      }))

    let time = 0
    let clockHand = 0 // The clock hand pointer

    references.forEach((reference, index) => {
      time++
      const framesCopy = JSON.parse(JSON.stringify(pageFrames)) as ClockFrame[]

      // Check if page is already in a frame
      const frameIndex = framesCopy.findIndex((frame) => frame.page === reference)

      if (frameIndex !== -1) {
        // Page hit - set reference bit to true
        framesCopy[frameIndex].lastUsed = time
        framesCopy[frameIndex].referenceBit = true

        steps.push({
          reference,
          frames: framesCopy,
          fault: false,
          algorithm: "clock",
          clockHand: clockHand, // Add the current clock hand position
        })
      } else {
        // Page fault - find a frame to replace using clock algorithm
        const startingHand = clockHand
        let replacedPage = null
        let replacementFound = false

        // First check if there are any empty frames
        const emptyFrameIndex = framesCopy.findIndex((frame) => frame.page === null)
        if (emptyFrameIndex !== -1) {
          // Found an empty frame, use it
          framesCopy[emptyFrameIndex] = {
            page: reference,
            lastUsed: time,
            loadedAt: time,
            referenceBit: true,
          }
          replacedPage = null
          clockHand = (emptyFrameIndex + 1) % frames // Move clock hand to next position
          replacementFound = true
        } else {
          // No empty frames, use the clock algorithm
          while (!replacementFound) {
            // If reference bit is 0, replace this page
            if (!framesCopy[clockHand].referenceBit) {
              replacedPage = framesCopy[clockHand].page
              framesCopy[clockHand] = {
                page: reference,
                lastUsed: time,
                loadedAt: time,
                referenceBit: true,
              }
              clockHand = (clockHand + 1) % frames // Move clock hand to next position
              replacementFound = true
            } else {
              // If reference bit is 1, set it to 0 and move to next frame
              framesCopy[clockHand].referenceBit = false
              clockHand = (clockHand + 1) % frames

              // If we've checked all frames and come back to the starting point
              if (clockHand === startingHand) {
                // All frames have reference bit 1, so reset the first one we find
                replacedPage = framesCopy[clockHand].page
                framesCopy[clockHand] = {
                  page: reference,
                  lastUsed: time,
                  loadedAt: time,
                  referenceBit: true,
                }
                clockHand = (clockHand + 1) % frames
                replacementFound = true
              }
            }
          }
        }

        steps.push({
          reference,
          frames: framesCopy,
          fault: true,
          replaced: replacedPage,
          algorithm: "clock",
          clockHand: clockHand, // Add the current clock hand position
        })
      }

      // Update the actual page frames for the next iteration
      for (let i = 0; i < pageFrames.length; i++) {
        pageFrames[i] = { ...framesCopy[i] }
      }
    })

    return steps
  }

  // Update the handleAlgorithmChange function to include the clock algorithm
  const handleAlgorithmChange = (value: string) => {
    const alg = value as Algorithm
    setAlgorithm(alg)

    // Update simulation steps based on the selected algorithm
    if (alg === "fifo") {
      setSimulationSteps(simulateFIFO(parsedReferences, frameCount))
    } else if (alg === "lru") {
      setSimulationSteps(simulateLRU(parsedReferences, frameCount))
    } else if (alg === "optimal") {
      setSimulationSteps(simulateOptimal(parsedReferences, frameCount))
    } else if (alg === "clock") {
      setSimulationSteps(simulateClock(parsedReferences, frameCount))
    }

    // Reset to beginning
    setCurrentStep(-1)
    setIsPlaying(false)
  }

  // Update the runSimulation function to include the clock algorithm
  const runSimulation = () => {
    const fifoSteps = simulateFIFO(parsedReferences, frameCount)
    const lruSteps = simulateLRU(parsedReferences, frameCount)
    const optimalSteps = simulateOptimal(parsedReferences, frameCount)
    const clockSteps = simulateClock(parsedReferences, frameCount)

    setStatistics({
      fifo: calculateStatistics(fifoSteps),
      lru: calculateStatistics(lruSteps),
      optimal: calculateStatistics(optimalSteps),
      clock: calculateStatistics(clockSteps),
    })

    // Set the steps for the currently selected algorithm
    if (algorithm === "fifo") {
      setSimulationSteps(fifoSteps)
    } else if (algorithm === "lru") {
      setSimulationSteps(lruSteps)
    } else if (algorithm === "optimal") {
      setSimulationSteps(optimalSteps)
    } else if (algorithm === "clock") {
      setSimulationSteps(clockSteps)
    }

    // Reset to beginning
    setCurrentStep(-1)
    setIsPlaying(false)
  }

  const calculateStatistics = (steps: SimulationStep[]) => {
    const faults = steps.filter((step) => step.fault).length
    return {
      faults,
      hits: steps.length - faults,
    }
  }

  const simulateFIFO = (references: number[], frames: number): SimulationStep[] => {
    const steps: SimulationStep[] = []
    const pageFrames: PageFrame[] = Array(frames)
      .fill(null)
      .map(() => ({
        page: null,
        lastUsed: 0,
        loadedAt: 0,
      }))

    let time = 0

    references.forEach((reference, index) => {
      time++
      const framesCopy = JSON.parse(JSON.stringify(pageFrames)) as PageFrame[]

      // Check if page is already in a frame
      const frameIndex = framesCopy.findIndex((frame) => frame.page === reference)

      if (frameIndex !== -1) {
        // Page hit
        steps.push({
          reference,
          frames: framesCopy,
          fault: false,
          algorithm: "fifo",
        })
      } else {
        // Page fault
        // Find the oldest frame (first in)
        const oldestFrameIndex = framesCopy
          .map((frame, index) => ({ index, loadedAt: frame.loadedAt }))
          .sort((a, b) => {
            // If a frame is empty (null), it should be filled first
            if (a.loadedAt === 0) return -1
            if (b.loadedAt === 0) return 1
            return a.loadedAt - b.loadedAt
          })[0].index

        const replacedPage = framesCopy[oldestFrameIndex].page

        framesCopy[oldestFrameIndex] = {
          page: reference,
          lastUsed: time,
          loadedAt: time,
        }

        steps.push({
          reference,
          frames: framesCopy,
          fault: true,
          replaced: replacedPage,
          algorithm: "fifo",
        })
      }

      // Update the actual page frames for the next iteration
      for (let i = 0; i < pageFrames.length; i++) {
        pageFrames[i] = { ...framesCopy[i] }
      }
    })

    return steps
  }

  const simulateLRU = (references: number[], frames: number): SimulationStep[] => {
    const steps: SimulationStep[] = []
    const pageFrames: PageFrame[] = Array(frames)
      .fill(null)
      .map(() => ({
        page: null,
        lastUsed: 0,
        loadedAt: 0,
      }))

    let time = 0

    references.forEach((reference, index) => {
      time++
      const framesCopy = JSON.parse(JSON.stringify(pageFrames)) as PageFrame[]

      // Check if page is already in a frame
      const frameIndex = framesCopy.findIndex((frame) => frame.page === reference)

      if (frameIndex !== -1) {
        // Page hit - update last used time
        framesCopy[frameIndex].lastUsed = time

        steps.push({
          reference,
          frames: framesCopy,
          fault: false,
          algorithm: "lru",
        })
      } else {
        // Page fault
        // Find the least recently used frame
        const lruFrameIndex = framesCopy
          .map((frame, index) => ({ index, lastUsed: frame.lastUsed }))
          .sort((a, b) => {
            // If a frame is empty (null), it should be filled first
            if (a.lastUsed === 0) return -1
            if (b.lastUsed === 0) return 1
            return a.lastUsed - b.lastUsed
          })[0].index

        const replacedPage = framesCopy[lruFrameIndex].page

        framesCopy[lruFrameIndex] = {
          page: reference,
          lastUsed: time,
          loadedAt: time,
        }

        steps.push({
          reference,
          frames: framesCopy,
          fault: true,
          replaced: replacedPage,
          algorithm: "lru",
        })
      }

      // Update the actual page frames for the next iteration
      for (let i = 0; i < pageFrames.length; i++) {
        pageFrames[i] = { ...framesCopy[i] }
      }
    })

    return steps
  }

  const simulateOptimal = (references: number[], frames: number): SimulationStep[] => {
    const steps: SimulationStep[] = []
    const pageFrames: PageFrame[] = Array(frames)
      .fill(null)
      .map(() => ({
        page: null,
        lastUsed: 0,
        loadedAt: 0,
      }))

    let time = 0

    references.forEach((reference, index) => {
      time++
      const framesCopy = JSON.parse(JSON.stringify(pageFrames)) as PageFrame[]

      // Check if page is already in a frame
      const frameIndex = framesCopy.findIndex((frame) => frame.page === reference)

      if (frameIndex !== -1) {
        // Page hit
        steps.push({
          reference,
          frames: framesCopy,
          fault: false,
          algorithm: "optimal",
        })
      } else {
        // Page fault
        // Find the frame that won't be used for the longest time in the future
        let optimalFrameIndex = 0
        let farthestUse = -1

        for (let i = 0; i < framesCopy.length; i++) {
          // If frame is empty, use it immediately
          if (framesCopy[i].page === null) {
            optimalFrameIndex = i
            break
          }

          // Find when this page will be used next
          const nextUseIndex = references.findIndex((ref, refIndex) => refIndex > index && ref === framesCopy[i].page)

          // If page won't be used again, this is optimal to replace
          if (nextUseIndex === -1) {
            optimalFrameIndex = i
            break
          }

          // If this page will be used later than the current farthest, update
          if (nextUseIndex > farthestUse) {
            farthestUse = nextUseIndex
            optimalFrameIndex = i
          }
        }

        const replacedPage = framesCopy[optimalFrameIndex].page

        framesCopy[optimalFrameIndex] = {
          page: reference,
          lastUsed: time,
          loadedAt: time,
        }

        steps.push({
          reference,
          frames: framesCopy,
          fault: true,
          replaced: replacedPage,
          algorithm: "optimal",
        })
      }

      // Update the actual page frames for the next iteration
      for (let i = 0; i < pageFrames.length; i++) {
        pageFrames[i] = { ...framesCopy[i] }
      }
    })

    return steps
  }

  const handlePlayPause = () => {
    if (currentStep === simulationSteps.length - 1) {
      // If at the end, restart
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleReset = () => {
    setCurrentStep(-1)
    setIsPlaying(false)
  }

  const handleStepForward = () => {
    if (currentStep < simulationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipToEnd = () => {
    setCurrentStep(simulationSteps.length - 1)
    setIsPlaying(false)
  }

  const currentDisplay = currentStep >= 0 ? simulationSteps[currentStep] : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Parameters</CardTitle>
            <CardDescription>Configure the page replacement simulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference-string">Reference String</Label>
              <Input
                id="reference-string"
                value={referenceString}
                onChange={(e) => setReferenceString(e.target.value)}
                placeholder="Enter comma-separated page references (e.g., 1,2,3,4,1,2,5)"
              />
              <p className="text-xs text-muted-foreground">Enter page numbers separated by commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frame-count">Number of Frames: {frameCount}</Label>
              <Slider
                id="frame-count"
                min={1}
                max={10}
                step={1}
                value={[frameCount]}
                onValueChange={(value) => setFrameCount(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>

              <Select value={algorithm} onValueChange={handleAlgorithmChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">First-In-First-Out (FIFO)</SelectItem>
                  <SelectItem value="lru">Least Recently Used (LRU)</SelectItem>
                  <SelectItem value="optimal">Optimal</SelectItem>
                  <SelectItem value="clock">Clock (Second Chance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Performance comparison of different algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fifo">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="fifo">FIFO</TabsTrigger>
                <TabsTrigger value="lru">LRU</TabsTrigger>
                <TabsTrigger value="optimal">Optimal</TabsTrigger>
                <TabsTrigger value="clock">Clock</TabsTrigger>
              </TabsList>

              <TabsContent value="fifo" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Faults</p>
                    <p className="text-2xl font-bold">{statistics.fifo.faults}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Hits</p>
                    <p className="text-2xl font-bold">{statistics.fifo.hits}</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Hit Ratio</p>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          parsedReferences.length > 0 ? (statistics.fifo.hits / parsedReferences.length) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">
                    {parsedReferences.length > 0
                      ? ((statistics.fifo.hits / parsedReferences.length) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  FIFO replaces the page that has been in memory the longest, regardless of usage.
                </p>
              </TabsContent>

              <TabsContent value="lru" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Faults</p>
                    <p className="text-2xl font-bold">{statistics.lru.faults}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Hits</p>
                    <p className="text-2xl font-bold">{statistics.lru.hits}</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Hit Ratio</p>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          parsedReferences.length > 0 ? (statistics.lru.hits / parsedReferences.length) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">
                    {parsedReferences.length > 0
                      ? ((statistics.lru.hits / parsedReferences.length) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  LRU replaces the page that hasn't been used for the longest period of time.
                </p>
              </TabsContent>

              <TabsContent value="optimal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Faults</p>
                    <p className="text-2xl font-bold">{statistics.optimal.faults}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Hits</p>
                    <p className="text-2xl font-bold">{statistics.optimal.hits}</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Hit Ratio</p>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          parsedReferences.length > 0 ? (statistics.optimal.hits / parsedReferences.length) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">
                    {parsedReferences.length > 0
                      ? ((statistics.optimal.hits / parsedReferences.length) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimal replaces the page that won't be used for the longest time in the future.
                </p>
              </TabsContent>

              <TabsContent value="clock" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Faults</p>
                    <p className="text-2xl font-bold">{statistics.clock.faults}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm font-medium">Page Hits</p>
                    <p className="text-2xl font-bold">{statistics.clock.hits}</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Hit Ratio</p>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          parsedReferences.length > 0 ? (statistics.clock.hits / parsedReferences.length) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">
                    {parsedReferences.length > 0
                      ? ((statistics.clock.hits / parsedReferences.length) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clock (Second Chance) is an approximation of LRU that uses a reference bit and a circular queue to
                  determine which page to replace.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Visualization</CardTitle>
          <CardDescription>Step through the page replacement process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handleStepBackward} disabled={currentStep <= 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant={isPlaying ? "outline" : "default"} onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleStepForward}
                  disabled={currentStep >= simulationSteps.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSkipToEnd}
                  disabled={currentStep >= simulationSteps.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <Select
                  value={playbackSpeed.toString()}
                  onValueChange={(value) => setPlaybackSpeed(Number.parseFloat(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="4">4x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm font-medium">Current Step:</span>
                  <span className="ml-2">
                    {currentStep + 1} of {simulationSteps.length}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Algorithm:</span>
                  <span className="ml-2 capitalize">{algorithm}</span>
                </div>
              </div>

              {currentDisplay ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Reference: {currentDisplay.reference}</p>
                    <p className="text-sm font-medium mb-2">
                      Status:
                      <span className={`ml-2 ${currentDisplay.fault ? "text-red-500" : "text-green-500"}`}>
                        {currentDisplay.fault ? "Page Fault" : "Page Hit"}
                      </span>
                      {currentDisplay.fault && currentDisplay.replaced !== null && (
                        <span className="ml-2">(Replaced: {currentDisplay.replaced})</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium">Memory Frames:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {currentDisplay.frames.map((frame, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 flex justify-between items-center ${
                            frame.page === currentDisplay.reference
                              ? "bg-green-100 dark:bg-green-900/20 border-green-500"
                              : ""
                          } ${
                            currentDisplay.fault && frame.page === currentDisplay.reference
                              ? "bg-amber-100 dark:bg-amber-900/20 border-amber-500"
                              : ""
                          } ${
                            algorithm === "clock" && currentDisplay.clockHand === index
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Frame {index}:</span>
                            {frame.page !== null ? (
                              <span className="text-lg font-bold">{frame.page}</span>
                            ) : (
                              <span className="text-muted-foreground">Empty</span>
                            )}
                          </div>

                          {algorithm === "fifo" && frame.page !== null && (
                            <span className="text-xs text-muted-foreground">Loaded at step: {frame.loadedAt}</span>
                          )}

                          {algorithm === "lru" && frame.page !== null && (
                            <span className="text-xs text-muted-foreground">Last used at step: {frame.lastUsed}</span>
                          )}

                          {algorithm === "clock" && frame.page !== null && (
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                                  (frame as ClockFrame).referenceBit
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                }`}
                              >
                                {(frame as ClockFrame).referenceBit ? "1" : "0"}
                              </span>
                              <span className="text-xs text-muted-foreground">Reference Bit</span>
                              {currentDisplay.clockHand === index && (
                                <span className="ml-2 text-blue-500">← Clock Hand</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Click Play or Step Forward to start the simulation</p>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Reference String Visualization:</p>
              <div className="flex flex-wrap gap-2">
                {parsedReferences.map((ref, index) => (
                  <div
                    key={index}
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full border
                      ${currentStep === index ? "bg-primary text-primary-foreground border-primary" : ""}
                      ${index < currentStep ? "bg-muted" : ""}
                    `}
                  >
                    {ref}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Algorithm Descriptions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <span className="font-medium">FIFO (First-In-First-Out):</span> Replaces the page that has been in
                memory the longest.
              </li>
              <li>
                <span className="font-medium">LRU (Least Recently Used):</span> Replaces the page that hasn't been
                accessed for the longest time.
              </li>
              <li>
                <span className="font-medium">Optimal:</span> Replaces the page that won't be used for the longest time
                in the future (theoretical best).
              </li>
              <li>
                <span className="font-medium">Clock (Second Chance):</span> Uses a circular queue with reference bits to
                approximate LRU with lower overhead.
              </li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default PageReplacementSimulator

