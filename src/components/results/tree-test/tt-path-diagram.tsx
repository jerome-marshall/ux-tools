'use client'
import { type EntireTreeTestResult } from '@/types'
import { getNodeNameById } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { ResponsiveSankey } from '@nivo/sankey'
import React, { useMemo } from 'react'

const getNodes = (treeStructure: TreeItem[]) => {
  if (treeStructure.length === 0) return []

  const nodes: { id: string }[] = []
  const nodeNames = new Set<string>() // Track node names to avoid duplicates

  const traverseNodes = (items: TreeItem[]) => {
    for (const node of items) {
      // Get node name, fall back to ID if name not found
      const nodeName = getNodeNameById(treeStructure, node.id)

      // If this node name is already added, make it unique
      let uniqueName = nodeName
      let counter = 1
      while (nodeNames.has(uniqueName)) {
        uniqueName = `${nodeName} (${counter})`
        counter++
      }

      nodeNames.add(uniqueName)
      nodes.push({ id: uniqueName })

      if (node.children && node.children.length > 0) {
        traverseNodes(node.children)
      }
    }
  }

  traverseNodes(treeStructure)
  return nodes
}

// This function processes the click data to generate links between nodes
const getLinks = (
  entireTestResults: EntireTreeTestResult[],
  treeStructure: TreeItem[]
) => {
  // This will hold our links data with counts
  const linkMap = new Map<string, { source: string; target: string; value: number }>()

  // Special "Start" node to represent the beginning of user paths
  const startNodeId = 'Start'
  // Track nodes to debug missing nodes
  const foundNodeIds = new Set<string>()

  for (const result of entireTestResults) {
    const clicks = result.treeTestClicks || []

    // If there are any clicks, add a link from Start to the first clicked node
    if (clicks.length > 0) {
      const firstNodeId = clicks[0].nodeId
      if (!firstNodeId) continue // Skip if nodeId is undefined

      // Try to get name, fall back to ID if not found
      const firstName = getNodeNameById(treeStructure, firstNodeId)
      foundNodeIds.add(firstNodeId)

      const startLinkKey = `${startNodeId}-${firstName}`

      if (linkMap.has(startLinkKey)) {
        const existingLink = linkMap.get(startLinkKey)!
        existingLink.value += 1
        linkMap.set(startLinkKey, existingLink)
      } else {
        linkMap.set(startLinkKey, {
          source: startNodeId,
          target: firstName,
          value: 1
        })
      }
    }

    // We need at least two clicks to form a link between actual nodes
    if (clicks.length < 2) continue

    // Process each pair of consecutive clicks
    for (let i = 0; i < clicks.length - 1; i++) {
      const sourceNodeId = clicks[i].nodeId
      const targetNodeId = clicks[i + 1].nodeId

      // Skip if either nodeId is undefined
      if (!sourceNodeId || !targetNodeId) continue

      foundNodeIds.add(sourceNodeId)
      foundNodeIds.add(targetNodeId)

      const sourceId = getNodeNameById(treeStructure, sourceNodeId)
      const targetId = getNodeNameById(treeStructure, targetNodeId)

      // Skip if source and target are the same
      if (sourceId === targetId) continue

      // Create a unique key for this link
      const linkKey = `${sourceId}-${targetId}`

      if (linkMap.has(linkKey)) {
        // Increment the count if this link already exists
        const existingLink = linkMap.get(linkKey)!
        existingLink.value += 1
        linkMap.set(linkKey, existingLink)
      } else {
        // Create a new link entry
        linkMap.set(linkKey, {
          source: sourceId,
          target: targetId,
          value: 1
        })
      }
    }
  }

  // Convert the map to an array and filter links with values below threshold
  const MIN_LINK_VALUE = 1 // Minimum number of users for a link to be displayed
  const links = Array.from(linkMap.values()).filter(link => link.value >= MIN_LINK_VALUE)

  // Create a topological ordering to detect circular dependencies
  return breakCycles(links)
}

// Function to break cycles in the graph to make it a DAG
const breakCycles = (links: Array<{ source: string; target: string; value: number }>) => {
  // Handle empty links array
  if (links.length === 0) return []

  // Create a graph representation
  const graph = new Map<string, Set<string>>()

  // Build the graph from links
  links.forEach(link => {
    if (!graph.has(link.source)) {
      graph.set(link.source, new Set())
    }
    graph.get(link.source)!.add(link.target)

    // Ensure target node exists in the graph even if it has no outgoing edges
    if (!graph.has(link.target)) {
      graph.set(link.target, new Set())
    }
  })

  // Check for cycles and ensure we have a directed acyclic graph
  const acyclicLinks: Array<{ source: string; target: string; value: number }> = []

  // We'll assign each node a layer to ensure proper hierarchical structure
  const layers = new Map<string, number>()
  const visited = new Set<string>()
  const recStack = new Set<string>() // For detecting cycles

  // Depth-first search to assign layers and detect cycles
  const assignLayers = (node: string, layer = 0): boolean => {
    // If node is already processed, use its layer
    if (visited.has(node)) {
      return !recStack.has(node) // Return true if not in recursion stack (no cycle)
    }

    // Mark node as visited and add to recursion stack
    visited.add(node)
    recStack.add(node)

    // Update node's layer (always use highest layer number)
    layers.set(node, Math.max(layer, layers.get(node) ?? 0))

    // Visit all neighbors
    let noCycles = true
    const neighbors = graph.get(node) ?? new Set()
    for (const neighbor of neighbors) {
      // If visiting neighbor creates a cycle, we'll update cycle flag
      if (!assignLayers(neighbor, layer + 1)) {
        noCycles = false
      }
    }

    // Remove from recursion stack
    recStack.delete(node)
    return noCycles
  }

  // Assign layers to all nodes
  Array.from(graph.keys()).forEach(node => {
    if (!visited.has(node)) {
      assignLayers(node)
    }
  })

  // Create links where source layer is always less than target layer
  links.forEach(link => {
    const sourceLayer = layers.get(link.source) ?? 0
    const targetLayer = layers.get(link.target) ?? 0

    // Special case for Start node - always keep it as the source
    if (link.source === 'Start') {
      acyclicLinks.push(link)
    }
    // Only include links that go forward in layers (or at same layer but with unique ID ordering)
    else if (
      sourceLayer < targetLayer ||
      (sourceLayer === targetLayer && link.source < link.target)
    ) {
      acyclicLinks.push(link)
    } else {
      // For backward links, reverse them but keep the same value
      acyclicLinks.push({
        source: link.target,
        target: link.source,
        value: link.value
      })
    }
  })

  return acyclicLinks
}

const TreeTestPathDiagram = ({
  treeStructure,
  entireTestResults
}: {
  treeStructure: TreeItem[]
  entireTestResults: EntireTreeTestResult[]
}) => {
  const { nodes, links } = useMemo(() => {
    const baseNodes = getNodes(treeStructure)
    // Add the Start node
    const allNodes = [{ id: 'Start' }, ...baseNodes]
    const pathLinks = getLinks(entireTestResults, treeStructure)

    // We need to ensure all nodes referenced in links are included in our nodes list
    const nodeIds = new Set(allNodes.map(node => node.id))
    const linkNodeIds = new Set([
      ...pathLinks.map(link => link.source),
      ...pathLinks.map(link => link.target)
    ])

    // Add any missing nodes
    for (const id of linkNodeIds) {
      if (!nodeIds.has(id)) {
        allNodes.push({ id })
      }
    }

    return { nodes: allNodes, links: pathLinks }
  }, [treeStructure, entireTestResults])

  // Handle case with no data
  if (links.length === 0) {
    return (
      <div className='flex h-[600px] items-center justify-center text-gray-500'>
        No path data available. Users need to complete the test first.
      </div>
    )
  }

  const data = {
    nodes,
    links
  }

  return (
    <div className='h-[600px]'>
      <ResponsiveSankey
        data={data}
        align='justify'
        colors={{ scheme: 'category10' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={Math.max(18, Math.min(50, 600 / nodes.length))}
        nodeSpacing={Math.max(8, Math.min(24, 400 / nodes.length))}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.8]]
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLabels={true}
        labelPosition='outside'
        labelOrientation='vertical'
        labelPadding={16}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1]]
        }}
      />
    </div>
  )
}

export default TreeTestPathDiagram
