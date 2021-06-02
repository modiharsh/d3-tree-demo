import { ThrowStmt } from '@angular/compiler';
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
  private width = 1000 - (this.margin * 2);
  private height = 500 - (this.margin * 2);
  private nodeListToTrack : d3.HierarchyPointNode<any>[];
  private nodeList : d3.HierarchyPointNode<any>[];

  constructor() { }

  ngOnInit(): void {
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
    
    root = d3.hierarchy(this.data);
    root.x0 = this.height / 2;
    root.y0 = 0;
    
    root.children.forEach(collapse);
    root.children.forEach(initPrev);
    
    this.nodeListToTrack = [];
    this.nodeList = [];

    const updateNode = (source) =>
          {
            
            var treeData = treemap(root);
            
            // Compute the new tree layout.
            var nodes = treeData.descendants(),
              links = treeData.descendants().slice(1);
            

            nodes.forEach(function(d){ d.y = d.depth * 180});
            this.nodeList = nodes;
            // ****************** Nodes section ***************************

            var nonHighlightedNodes = nodes.concat(this.nodeListToTrack).filter(item => !nodes.includes(item) || !this.nodeListToTrack.includes(item));
            // Update the nodes...
           
            var node = this.svg.selectAll('g.node')
            .data(nodes, function(d) { return  d.id || (d.id = ++i); });
            
                        // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
              var translateX = source.x0 || source.x;
              var translateY = source.y0 || source.y;
              return "translate(" + translateX  + "," + translateY  + ")";
            })
            .on('click', click)
            .on("mouseover", mouseover)
            .on("mousemove", function(d){mousemove(d);})
            .on("mouseout", mouseout);
            
            // Add cicular for the nodes
            nodeEnter.append('rect')
            .attr('class', 'node')
            .attr('xmlns','http://www.w3.org/2000/svg')
            .attr('rx', 15)
            .text(function(d){ return d.data.name;})
            .attr("transform", function(d) {
              return "translate(" + 0 + "," + -15 + ")";
            })
            .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
            });   

          // Add labels for the nodes
          nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? 13 : 13;
            })
            .attr("text-anchor", "start")
            .text(function(d) { 
              var nodeSign =  d._children ? "+  " : "-  ";
              return nodeSign + d.data.name  ; });


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
          
          // Update the node attributes and style
          nodeUpdate.select('rect.node')
          .attr('r', 10)
          .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
          })
          .attr('cursor', 'pointer');

          nodeUpdate.select('text')
          .text(function(d) { 
            var nodeSign =  d._children ? "+  " : "-  ";
            return nodeSign + d.data.name  ; });

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
        
            
            this.nodeListToTrack.pop();

            var nonHighlightedLinks = links.concat(this.nodeListToTrack).filter(item => !links.includes(item) || !this.nodeListToTrack.includes(item));
            
        // Update the links...
        /* var link = this.svg.selectAll('path.highlight-link')
        .data(this.nodeListToTrack, function(d) { return d.id; });
        //console.log(link); 
        
      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "highlight-link")
        .attr('d', function(d){
            var x0 = source.x0 || source.x;
            var y0 = source.y0 || source.y;
          var o = {x: x0, y: y0} //{x: source.x0, y: source.y0}
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
        .remove(); */

      var link = this.svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });
        //console.log(link); 
        
      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
            var x0 = source.x0 || source.x;
            var y0 = source.y0 || source.y;
          var o = {x: x0, y: y0} //{x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

      linkEnter.each(function(d,i){
        var highlightFlag = false;
                 
          if( i ==-1){
           
            highlightFlag = true;
            d3.select(this).attr("class","highlight-link");
            
          }
        
        

      })
        
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

    
    const traceNode = (source, flag) =>
          {
            
            var currNode = source;
            this.nodeListToTrack = [];
            this.nodeListToTrack.push(currNode);
            if( source == root) this.nodeListToTrack.pop();
            
            if( flag == 'full'){
              while( currNode.parent){
                
                this.nodeListToTrack.push(currNode.parent);
                currNode = currNode.parent;
              }
            }
            //console.log(this.nodeListToTrack);            
            // ****************** Nodes section ***************************

            // Update the nodes...
            
             var node = this.svg.selectAll('g.highlight-node')
            .data(this.nodeListToTrack, function(d) { return  d.id || (d.id = ++i); });
            
                        // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
            .attr('class', 'highlight-node')
            .attr("transform", function(d) {
              var translateX = source.x0 || source.x;
              var translateY = source.y0 || source.y;
              return "translate(" + translateX  + "," + translateY  + ")";
            })
            .on('click', click)
            .on("mouseover", mouseover)
            .on("mousemove", function(d){mousemove(d);})
            .on("mouseout", mouseout); 
            
            // Add cicular for the nodes
             nodeEnter.append('rect')
            .attr('class', 'node')
            .attr('xmlns','http://www.w3.org/2000/svg')
            .attr('rx', 15)
            .text(function(d){ return d.data.name;})
            .attr("transform", function(d) {
              return "translate(" + 0 + "," + -15 + ")";
            })
            .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
            });   

          // Add labels for the nodes
           nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? 13 : 13;
            })
            .attr("text-anchor", "start")
            .text(function(d) { 
              var nodeSign =  d._children ? "+  " : "-  ";
              return nodeSign + d.data.name  ; });


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
          
          // Update the node attributes and style
           nodeUpdate.select('rect.node')
          .attr('r', 10)
          .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
          })
          .attr('cursor', 'pointer');

          nodeUpdate.select('text')
          .text(function(d) { 
            var nodeSign =  d._children ? "+  " : "-  ";
            return nodeSign + d.data.name  ; });
 
          
          // Remove any exiting nodes
          var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
          

            // ****************** links section ***************************

        // Update the links...
        this.nodeListToTrack.pop();
        
        var link = this.svg.selectAll('path.highlight-link')
        .data(this.nodeListToTrack, function(d) { return d.id; });
        //console.log(link); 
        
      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "highlight-link")
        .attr('d', function(d){
            var x0 = source.x0 || source.x;
            var y0 = source.y0 || source.y;
          var o = {x: x0, y: y0} //{x: source.x0, y: source.y0}
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
        //updateNode(source);
      

    }

    
    var emptyDiv  = d3.select("figure#node-tree").append("div")

    var resetButton  = d3.select("figure#node-tree").append("button")
    .attr("class","menubutton")
    .text("Reset Nodes")
    .on("click", () => { 
      this.nodeListToTrack = [];
      traceNode(root,null);
    });

    var nodeInput  = d3.select("figure#node-tree").append("input")
    .attr("class","inputbox")
    .attr("id", "nodeInputBox")
    .attr("placeholder","Enter Node Name")
    ;

    var searchButton  = d3.select("figure#node-tree").append("button")
    .attr("class","menubutton")
    .text("Search Node")
    .on("click",() => {
      
      var inputNodeName =(<HTMLInputElement> document.getElementById("nodeInputBox")).value;
            
      this.nodeList.some(node => {
        if(node.data['name'].toLowerCase() == inputNodeName.toLowerCase()){
          this.nodeListToTrack = [];
          traceNode(root,null);
          traceNode(node,'single');
          return true;
          
        }
      });
    });

    var traceButton = d3.select("figure#node-tree").append("button")
      .attr("class","menubutton")
      .text("Trace Node")
      .on("click",() => { 
        var inputNodeName =(<HTMLInputElement> document.getElementById("nodeInputBox")).value;
        if (inputNodeName && inputNodeName != ""){
          this.nodeList.some(node => {
            if(node.data['name'].toLowerCase() == inputNodeName.toLowerCase()){
              traceNode(node,'full');
              return true;
            }
          })
        }
        else{
          traceNode(root.children[1].children[1].children[0],'full');
        }
      
      });
    
    
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
        //console.log(d);
        
        if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
        
        
        updateNode(d);
        traceNode(root,null);
        updateNode(d);
        //traceNode(root);
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


  private largedata = { name: "FrtbSBMCalculator",
    children: [
        {
            name: "FrtbSBMPositions",
            children: [
              {
                name: "FrtbPreprocess",
                children: [
                  {
                    name: "FrtbPositions",
                    children: [
                      {
                        name: "ZincFrtbImporter"
                      }
                    ]
                  }
                ]
              }

            ]
        },
        {
          name: "FrtbRefDataGroup",
          children: [
            {
              name: "FrtbRefData1",
              children: [
                { name: "RdmDataImporter" }
              ]
            },
            {
              name: "FrtbRefData2",
              children: [
                { name: "RdmDataImporter" }
              ]
            },
            {
              name: "FrtbRefData3",
              children: [
                { name: "RdmDataImporter" }
              ]
            },
          ]
        }
        
        
    ]
  };
  

}
