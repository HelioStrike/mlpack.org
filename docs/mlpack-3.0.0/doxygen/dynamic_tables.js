/**
 * Utility function to return the last valid space we can break on, given HTML.
 * We don't want to break inside of an HTML tag or inside a template argument.
 */
function lastValidSpaceIndex(html)
{
  var lastSpaceIndex = 0;
  var inTag = false;
  var templateDepth = 0;
  for (var k = 0; k < html.length - 1; ++k)
  {
    if (html[k] === '<')
    {
      if (inTag)
      {
        console.log("Unexpected double tag at character " + k + "!");
        console.log(html);
      }
      inTag = true;
    }
    else if (html[k] === '>')
    {
      if (!inTag)
      {
        console.log("Unexpected tag close at character " + k + "!");
        console.log(html);
      }
      inTag = false;
    }
    else if (html[k] === '&' && !inTag)
    {
      if (k + 3 < html.length &&
          html.substring(k, k + 4) === '&lt;')
      {
        templateDepth++;
      }
      else if (k + 3 < html.length &&
               html.substring(k, k + 4) === '&gt;')
      {
        templateDepth--;
      }
    }
    else if (html[k] === ' ' && templateDepth === 0 && !inTag)
    {
      // Seems like a valid space, take it.
      lastSpaceIndex = k;
    }
  }

  return lastSpaceIndex;
}

/**
 * Given some HTML that contains a template declaration, parse that template
 * declaration, formatting it in a series of divs so that it can be formatted
 * properly.
 *
 * The keyword 'template' will go into a class="template_decl" div.
 * The open-bracket character will go into a class="open_bracket" div.
 * The close-bracket character will go into a class="close_bracket" div.
 * The keyword 'typename' or 'class' will go into a class="type_decl" div.
 * An identifier will go into a class="identifier" div.
 * The keyword 'const' will go into a class="modifier" div.
 *
 * All of this will be put into a div with class="template_expr".
 */
function parseTemplateHTML(html)
{
  var inTag = false;
  var lastSpaceIndex = 0;
  var newDiv = document.createElement('div');
  newDiv.className = "template_decl";

  for (var i = 0; i < html.length - 1; ++i)
  {
    // Basically we will just walk along looking for template arguments.
    if (html[i] === '<')
    {
      if (inTag)
      {
        console.log("Unexpected double tag at character " + i + "!");
        console.log(html);
      }
      inTag = true;
    }
    else if (html[i] === '>')
    {
      if (!inTag)
      {
        console.log("Unexpected tag close at character " + i + "!");
        console.log(html);
      }
      inTag = false;
    }
    if (html[i] === '&' && !inTag)
    {
      if (i + 3 < html.length &&
          html.substring(i, i + 4) === '&lt;')
      {
        // This is an opening declaration.

        // We have to handle the previous data.
        var previousData = html.substring(lastSpaceIndex, i).trim();
        if (previousData === "class" || previousData === "typename")
        {
          var typeDeclDiv = document.createElement('div');
          typeDeclDiv.className = 'type_decl';
          typeDeclDiv.innerHTML = previousData;
          newDiv.append(typeDeclDiv);
        }
        else if (previousData === "template")
        {
          var templateDeclDiv = document.createElement('div');
          templateDeclDiv.className = 'template_decl';
          templateDeclDiv.innerHTML = previousData;
          newDiv.append(templateDeclDiv);
        }
        else if (previousData === "const")
        {
          var modifierDiv = document.createElement('div');
          modifierDiv.className = 'modifier';
          modifierDiv.innerHTML = previousData;
          newDiv.append(modifierDiv);
        }
        else
        {
          // No clue what it is.
          var identifierDiv = document.createElement('div');
          identifierDiv.className = 'identifier';
          identifierDiv.innerHTML = previousData;
          newDiv.append(identifierDiv);
        }

        // Create a div for opening the bracket.
        var openingDiv = document.createElement('div');
        openingDiv.className = "open_bracket";
        openingDiv.innerHTML = '&lt;';
        newDiv.append(openingDiv);

        i += 3;
        lastSpaceIndex = i + 1;
      }
      else if (i + 3 < html.length &&
               html.substring(i, i + 4) === '&gt;')
      {
        // This is a closing declaration.

        // We have to handle the previous data.
        var previousData = html.substring(lastSpaceIndex, i).trim();
        if (previousData === "class" || previousData === "typename")
        {
          var typeDeclDiv = document.createElement('div');
          typeDeclDiv.className = 'type_decl';
          typeDeclDiv.innerHTML = previousData;
          newDiv.append(typeDeclDiv);
        }
        else if (previousData === "template")
        {
          var templateDeclDiv = document.createElement('div');
          templateDeclDiv.className = 'template_decl';
          templateDeclDiv.innerHTML = previousData;
          newDiv.append(templateDeclDiv);
        }
        else if (previousData === "const")
        {
          var modifierDiv = document.createElement('div');
          modifierDiv.className = 'modifier';
          modifierDiv.innerHTML = previousData;
          newDiv.append(modifierDiv);
        }
        else
        {
          // No clue what it is.
          var identifierDiv = document.createElement('div');
          identifierDiv.className = 'identifier';
          identifierDiv.innerHTML = previousData;
          newDiv.append(identifierDiv);
        }

        // Now create the closing div.
        var closingDiv = document.createElement('div');
        closingDiv.className = 'close_bracket';
        closingDiv.innerHTML = '&gt;';
        newDiv.append(closingDiv);

        i += 3;
        lastSpaceIndex = i + 1;
      }
    }
    if (html[i] === ' ' && !inTag)
    {
      // Check if we need to do anything.
      var previousData = html.substring(lastSpaceIndex, i).trim();
      if (previousData === "class" || previousData === "typename")
      {
        var typeDeclDiv = document.createElement('div');
        typeDeclDiv.className = 'type_decl';
        typeDeclDiv.innerHTML = previousData;
        newDiv.append(typeDeclDiv);
      }
      else if (previousData === "template")
      {
        var templateDeclDiv = document.createElement('div');
        templateDeclDiv.className = 'template_decl';
        templateDeclDiv.innerHTML = previousData;
        newDiv.append(templateDeclDiv);
      }
      else if (previousData === "const")
      {
        var modifierDiv = document.createElement('div');
        modifierDiv.className = 'modifier';
        modifierDiv.innerHTML = previousData;
        newDiv.append(modifierDiv);
      }
      else
      {
        continue; // Nothing to do, keep reading.
      }

      lastSpaceIndex = i;
    }
  }

  previousData = html.substring(lastSpaceIndex);

  // Get the last data into the last div.
  if (previousData === "class" || previousData === "typename")
  {
    var typeDeclDiv = document.createElement('div');
    typeDeclDiv.className = 'type_decl';
    typeDeclDiv.innerHTML = previousData;
    newDiv.append(typeDeclDiv);
  }
  else if (previousData === "template")
  {
    var templateDeclDiv = document.createElement('div');
    templateDeclDiv.className = 'template_decl';
    templateDeclDiv.innerHTML = previousData;
    newDiv.append(templateDeclDiv);
  }
  else if (previousData === "const")
  {
    var modifierDiv = document.createElement('div');
    modifierDiv.className = 'modifier';
    modifierDiv.innerHTML = previousData;
    newDiv.append(modifierDiv);
  }
  else
  {
    var lastDiv = document.createElement('div');
    lastDiv.className = 'identifier';
    lastDiv.innerHTML = previousData;
    newDiv.append(lastDiv);
  }

  return newDiv;
}

// When we load the page, go through each of the tables and make sure that the
// given width is such that the table is readable.
window.onload = function()
{
  // We want to modify tables of class 'memname'.  We want to do the following:
  //
  // 1. strip namespace information into separate line if needed
  // 2. make sure the td with the name of the function is wide enough to fit it
  // 3. make sure the td with the '(' and ')' is exactly as wide as it needs to
  //      be
  // 4. make sure that the parameter names are all sufficiently long
  // 5. use any extra space for the parameter types, with mouseover showing the
  //      full type
  //
  // But what if there is no extra space at all?  Then we have to put the
  // function name on a separate line and make it a three-column table.
  var tables = document.querySelectorAll('table.memname');
  console.log(JSON.stringify(tables));
  var maxWidth = 560; // 560 pixels wide, maximum.  This accounts for the margins.
  if (tables !== null)
  {
    for (var i = 0; i < tables.length; i++)
    {
      // Now we are looking at tables[i].  Loop over each of its child's
      // children (which will be <tr>s), in order to find the maximum widths of
      // each.
      var trs = tables[i].children[0].children;
      // These will hold the maximum current widths.
      var nameWidth = 0, parenWidth = 0, paramTypeWidth = 0, paramNameWidth = 0,
          secondParenWidth = 0, qualifierWidth = 0;
      for (var j = 0; j < trs.length; j++)
      {
        // Now each tr will have four tds only.
        var tds = trs[j].children;
        if (tds.length === 4)
        {
          nameWidth = Math.max(nameWidth, tds[0].clientWidth);
          parenWidth = Math.max(parenWidth, tds[1].clientWidth);
          paramTypeWidth = Math.max(paramTypeWidth, tds[2].clientWidth);
          paramNameWidth = Math.max(paramNameWidth, tds[3].clientWidth);
        }
        else if (tds.length === 5)
        {
          // This method has a qualifier.
          nameWidth = Math.max(nameWidth, tds[0].clientWidth);
          parenWidth = Math.max(parenWidth, tds[1].clientWidth);
          paramTypeWidth = Math.max(paramTypeWidth, tds[2].clientWidth);
          paramNameWidth = Math.max(paramNameWidth, tds[3].clientWidth);
          qualifierWidth = Math.max(qualifierWidth, tds[4].clientWidth);
        }
        else if (tds.length === 6)
        {
          // This declaration is all on one line.
          nameWidth = Math.max(nameWidth, tds[0].clientWidth);
          parenWidth = Math.max(parenWidth, tds[1].clientWidth);
          paramTypeWidth = Math.max(paramTypeWidth, tds[2].clientWidth);
          paramNameWidth = Math.max(paramNameWidth, tds[3].clientWidth);
          secondParenWidth = Math.max(secondParenWidth, tds[4].clientWidth);
          qualifierWidth = Math.max(qualifierWidth, tds[5].clientWidth);
        }
        else if (tds.length === 1)
        {
          // This is a member declaration with only one column.
          nameWidth = Math.max(nameWidth, tds[0].clientWidth);
        }
        else
        {
          console.log("Encountered tr with " + tds.length + " tds!");
        }
      }

      var computedParamNameWidth = maxWidth - (nameWidth + parenWidth +
          paramNameWidth + secondParenWidth + qualifierWidth);
      if (computedParamNameWidth <= 150)
      {
        // Special action needed: try reducing the length of the name of the
        // method.  First try wrapping on a space.

        // Remove any extraneous whitespace from the beginning and end of the
        // HTML...
        trs[0].children[0].innerHTML = trs[0].children[0].innerHTML.trim();

        var name = trs[0].children[0].innerText;
        console.log("function '" + name + "' is too wide, len " + trs[0].children[0].innerHTML.length + "!");

        // Find the last space that is not in a tag or part of a template
        // expression.  We ignore the last character because it may be padding.
        var lastSpaceIndex = lastValidSpaceIndex(trs[0].children[0].innerHTML);

        // Attempt to split at the last space.
        var newInnerHTML = trs[0].children[0].innerHTML.substring(lastSpaceIndex);
        var outsideInnerHTML = trs[0].children[0].innerHTML.substring(0, lastSpaceIndex);

        // Now set the HTML in the name parameter to only have the function
        // name, and then add a new TR to the parent that spans all columns.
        trs[0].children[0].innerHTML = newInnerHTML;
        nameWidth = trs[0].children[0].clientWidth;

        var newTr = document.createElement("tr");
        var newTd = document.createElement("td");
        newTd.innerHTML = outsideInnerHTML;
        newTd.colSpan = (secondParenWidth > 0 || qualifierWidth > 0) ? 6 : 4;
        newTr.append(newTd);

        console.log("New width " + nameWidth);

        // Recompute the paramName width.
        computedParamNameWidth = Math.max(10, maxWidth - (nameWidth + parenWidth
            + paramNameWidth + secondParenWidth + qualifierWidth));
        console.log("New computed param name width " + computedParamNameWidth);

        if (computedParamNameWidth > 150)
        {
          tables[i].children[0].insertBefore(newTr, trs[0]);
        }
        else
        {
          console.log("Second try!");

          // Round two: try putting the namespace/class on its own separate tr, then
          // the parameters on their own lines.

          var secondNewTr = document.createElement("tr");
          var secondNewTd = document.createElement("td");

          // Find the index to split on the last namespace/class (::).
          var lastIndex = newInnerHTML.lastIndexOf(':');
          secondNewTd.innerHTML = newInnerHTML.substr(0, lastIndex);
          trs[0].children[0].innerHTML = newInnerHTML.substr(lastIndex + 1);
          secondNewTd.colSpan = (secondParenWidth > 0 || qualifierWidth > 0) ? 6 : 4;
          secondNewTr.append(secondNewTd);

          tables[i].children[0].insertBefore(secondNewTr, trs[0]);
          tables[i].children[0].insertBefore(newTr, secondNewTr);

          // Is the second new td too wide?
          console.log("new td width " + secondNewTd.clientWidth);
          if (secondNewTd.clientWidth <= 580)
          {
            nameWidth = 100; /* force to 100px */
            computedParamNameWidth = Math.max(10, maxWidth - (nameWidth +
                parenWidth + paramNameWidth + secondParenWidth + qualifierWidth));
          }
          else
          {
            console.log("line too long!");
            /*
            // Round three: try putting the function name on its own separate tr,
            // then the parameters on their own lines.
            console.log("Third try!");
            // Now we will strip the function name only and put that on a third
            // line.

            var lastColonIndex = secondNewTd.innerHTML.lastIndexOf(':');
            if (lastColonIndex == -1)
            {
              console.log("Can't find a colon to split on!  Failed.");
              nameWidth = 100; /* force to 100px */
            /*
            }
            else
            {
              trs[2].children[0].innerHTML = secondNewTd.innerHTML.substring(lastColonIndex + 1);
              secondNewTd.innerHTML = secondNewTd.innerHTML.substring(0, lastColonIndex + 1);

              nameWidth = trs[2].children[0].clientWidth;
              console.log("Final name width " + nameWidth);

              // TODO: if it's __still__ too wide, we have to parse the template
              // arguments.
            }

            computedParamNameWidth = Math.max(10, maxWidth - (nameWidth +
                parenWidth + paramNameWidth + secondParenWidth + qualifierWidth));
            */
          }
        }
      }

      // Now that we know the width of the elements, set the widths
      // preferentially, by looping over all the trs again.
      for (var j = 0; j < trs.length; j++)
      {
        var tds = trs[j].children;
        if (tds.length === 4)
        {
          tds[0].style.width = nameWidth + "px";
          tds[1].style.width = parenWidth + "px";
          tds[2].style.width = computedParamNameWidth + "px";
          tds[2].style.maxWidth = tds[2].style.width;
          tds[2].style.textOverflow = "ellipsis";
          tds[2].style.overflow = "hidden";
          tds[3].style.width = paramNameWidth + "px";
        }
        else if (tds.length == 6)
        {
          tds[0].style.width = nameWidth + "px";
          tds[1].style.width = parenWidth + "px";
          tds[2].style.width = computedParamNameWidth + "px";
          tds[2].style.maxWidth = tds[2].style.width;
          tds[2].style.textOverflow = "ellipsis";
          tds[2].style.overflow = "hidden";
          tds[3].style.width = paramNameWidth + "px";
          tds[4].style.width = secondParenWidth + "px";
          tds[5].style.width = qualifierWidth + "px";
        }
      }

      // If it is six columns, we have to make sure that the following
      // mlabels-right has the float: right attribute.  The mlabels-right td is
      // the last child of the parent of the parent table.
      if (secondParenWidth > 0 || qualifierWidth > 0)
      {
        var mlabelsright = tables[i].parentElement.parentElement.children[1];
        mlabelsright.style.cssFloat = "right";
      }
    }
  }

  // Force td.memItemLeft and td.memTemplItemLeft tables to have custom style.
  var tds = document.querySelectorAll('td.memItemLeft, td.memTemplItemLeft');
  for (i = 0; i < tds.length; ++i)
  {
    // Put all the content in a div.
    var contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'white-space: nowrap; text-overflow: ellipsis; overflow: hidden; color: #fff; text-align: left; width: 150px;';
    contentDiv.innerHTML = tds[i].innerHTML.trim();
    contentDiv.className = 'content';

    tds[i].innerHTML = '';
    tds[i].style.cssText = '';
    tds[i].append(contentDiv);
  }

  for(i = 0; i < tds.length; ++i)
  {
    if (tds[i].children[0].offsetWidth < tds[i].children[0].scrollWidth)
    {
      console.log("td " + i + " is too wide!");

      var hoverDiv = document.createElement('div');
      hoverDiv.className = 'hover';
      hoverDiv.innerHTML = tds[i].children[0].innerHTML.trim();
      hoverDiv.style.width = tds[i].children[0].scrollWidth;

      tds[i].append(hoverDiv);
    }
  }

  // Next, make sure that tooltips show on hover.
  var paramtypes = document.querySelectorAll('td.paramtype');
  for (i = 0; i < paramtypes.length; ++i)
  {
    if (paramtypes[i].offsetWidth < paramtypes[i].scrollWidth)
    {
      // We need to add a tooltip, but we also have to put the existing stuff
      // into its own styled div.
      var contentDiv = document.createElement('div');
      contentDiv.style.cssText = paramtypes[i].style.cssText;
      contentDiv.innerHTML = paramtypes[i].innerHTML;
      contentDiv.className = 'content';

      var hoverDiv = document.createElement('div');
      hoverDiv.className = 'hover';
      hoverDiv.innerHTML = paramtypes[i].innerHTML;
      hoverDiv.style.width = paramtypes[i].scrollWidth;

      paramtypes[i].innerHTML = '';
      paramtypes[i].style.cssText = '';
      paramtypes[i].append(contentDiv);
      paramtypes[i].append(hoverDiv);
    }
  }
}
