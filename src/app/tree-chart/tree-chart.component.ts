import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { D3BrushEvent } from 'd3';

@Component({
  selector: 'app-tree-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tree-chart.component.html',
  styleUrls: ['./tree-chart.component.css']
})
export class TreeChartComponent implements OnInit {

  private svg ;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 500 - (this.margin * 2);
  private nodeListToTrack : d3.HierarchyPointNode<any>[];

  constructor() { }

  ngOnInit(): void {
    
    //console.log(this.data);
    var obj = d3.hierarchy(this.data);
    //console.log(obj);
    
    this.createTreeGraph();
  }

  private createTreeGraph(): void{
    
    this.svg = d3.select("figure#node-tree")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin  + "," + this.margin + ")");
    
    var i = 0,
      duration = 750,
      root;

    var div = d3.select("figure#node-tree").append("div")
      .attr("class", "tooltip")
      .style("opacity", 1e-6);

    var treemap = d3.tree()
      .size([this.height, this.width]);
    
    /* var diagonal = d3.diia
      .projection(function(d) { return [d.y, d.x]; });
 */
    root = d3.hierarchy(this.data);
    //console.log(root);
    root.x0 = this.height / 2;
    root.y0 = 0;
    
    root.children.forEach(collapse);
    root.children.forEach(initPrev);
    //console.log(root);

    this.nodeListToTrack = [];

    const updateNode = (source) =>
          //function update(source)
          {
            //console.log(source);
            var treeData = treemap(root);
            //console.log(treeData);
            // Compute the new tree layout.
            var nodes = treeData.descendants(),
              links = treeData.descendants().slice(1);
            //console.log(nodes);
            //console.log(links);

            nodes.forEach(function(d){ d.y = d.depth * 180});
            //console.log(nodes);

            // ****************** Nodes section ***************************

            // Update the nodes...
            //console.log(this.svg);
            var node = this.svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });
            
            //console.log("CP0");
            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
              
              return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click)
            .on("mouseover", mouseover)
            .on("mousemove", function(d){mousemove(d);})
            .on("mouseout", mouseout);
            //console.log("CP1");
            //console.log(nodeEnter);

            // Add cicular for the nodes
            nodeEnter.append('rect')
            .attr('class', 'node')
            .attr('xmlns','http://www.w3.org/2000/svg')
            .attr('height', 30)
            .attr('width', 100)
            .attr('rx', 15)
            .text(function(d){ return d.data.name;})
            .attr("transform", function(d) {
              return "translate(" + 0 + "," + -15 + ")";})
            .style("fill", function(d) {
              
                return d._children ? "lightsteelblue" : "#fff";
            });

            var nodeEnter2 = nodeEnter.append('foreignObject')
              .attr('class','foNode')
              .attr('height', 30)
              .attr('width', 100)
              .attr('rx', 15)
              .attr("transform", function(d) {
                return "translate(" + 0 + "," + -15 + ")";});

            nodeEnter2.append('xhtml:div')
            .attr('xmlns','http://www.w3.org/1999/xhtml')
            .attr('class','nodeText')
            .text('div value');

            


          // Add labels for the nodes
          /* nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? 13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "start" : "start";
            })
            .text(function(d) { 
              var nodeSign =  d._children ? "+  " : "-  ";
              return nodeSign + d.data.name  ; });
 */
          /* To make +/- sign appear on end of node 
          nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", 90 )
           .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "end";
            })
            .text(function(d) { 
              var nodeSign =  d._children ? "+  " : "-  ";
              return nodeSign  ; }); */

            nodeEnter.append("text")
              .attr("dx", 8)
              .attr("dy", 3)
              .style("opacity",0)
              .text(function(d) { return "Demo"; })

          // UPDATE
          var nodeUpdate = nodeEnter.merge(node);

          // Transition to the proper position for the node
          nodeUpdate.transition()
          .duration(duration)
          .attr("transform", function(d) { 
            return "translate(" + d.y + "," + d.x + ")";
          });
          //console.log("CP2");
          // Update the node attributes and style
          nodeUpdate.select('rect.node')
          .attr('r', 10)
          .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
          })
          .attr('cursor', 'pointer');

         /*  nodeUpdate.select('text')
          .text(function(d) { 
            var nodeSign =  d._children ? "+  " : "-  ";
            return nodeSign + d.data.name  ; }); */

          
          // Remove any exiting nodes
          var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

          // On exit reduce the node circles size to 0
          nodeExit.select('circle')
          .attr('r', 1e-6);

          // On exit reduce the opacity of text labels
          nodeExit.select('text')
          .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

        // Update the links...
        var link = this.svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });
        //console.log(link); 

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

      // UPDATE
      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ 
          return diagonal(d, d.parent) });

      // Remove any exiting links
      var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d,i){
        //console.log(d);
        source.x0 = d.x;
        source.y0 = d.y; 
      });


    }
    
    updateNode(root);

    
      // Collapse the node and all it's children
      function collapse(d) {
        //console.log(d);
        if(d.children) {
          d._children = d.children
          d._children.forEach(collapse)
          d.children = null
        }
        //console.log(d);
      }

      function initPrev(d){
        d.x0 = d.x;
        d.y0 = d.y;

      }

      

        // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {
        //console.log(d)
        let path = `M ${s.y+30} ${s.x}
                C ${(s.y + 30 + d.y) / 2} ${s.x},
                  ${(s.y + 30 + d.y) / 2} ${d.x},
                  ${d.y+30} ${d.x}`

        return path
      }

      // Toggle children on click.
      function click(event,d) {
        console.log(d);
        
        if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
        
        
        updateNode(d);
        
      }

      function mouseover(event,d) {
        
        //d.target.style.strokeWidth = 2.5;
        //d.target.style.stroke = "palevioletred";
        div.transition()
        .duration(300)
        .style("opacity", 1);

        //trackBack(d);
        
      }

      function mousemove(d) {
        
        div
        .text("Tooltip")
        .style("left", (d.x  ) + "px")
        .style("top", (d.y + 20) + "px");
      }


      function mouseout() {
          div.transition()
          .duration(400)
          .style("opacity", 1e-6);

          
        
      }

      function trackBack(d){
        //var nodeListToTrack = [];
        var currNode = d;
        //console.log(currNode);
        this.nodeListToTrack.push(currNode);
        while( currNode.parent){
          //console.log(currNode.parent);
          this.nodeListToTrack.push(currNode.parent);
          currNode = currNode.parent;
        }
        console.log(this.nodeListToTrack);
        //updateNode(d);

        
      }

  }

  private data = { name: "rootNode",
    children: [
        {
            name: "child1"
        },
        {
            name: "child2",
            children: [
                { name: "grandChild1" },
                { name: "grandChild2",
                  children: [
                    { name : "greatgrandchild1" },
                    
                  ]
                },
                { name: "grandChild3" },
                { name: "grandChild4" }
            ]
        },
        {
            name: "child3",
            children: [
                { name: "grandChild5" },
                { name: "grandChild6" },
            ]
        }
    ]
  };



}
