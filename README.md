# XYChart 自由散点图工具 Free Scatter Plot Tool  

## 这有什么用？What's the use of this?  

这是一个简单的xy散点图单页面web应用，使用了echarts组件，实现了xy散点图、3d散点图、热力图三种图表。

它可以自动分析`.csv`文件的列结构，然后让用户自由地选择x、y、z(对于3d)，以及分组依据、点大小，分别使用哪些列，程序就会显示图表。

This is a simple xy scatter plot single-page web application that uses the echarts component to implement three types of charts: xy scatter plot, 3d scatter plot, and heat map.  

It can automatically analyze the column structure of the `.csv` file, and then allow users to freely select x, y, z (for 3d), as well as the grouping basis, point size, etc., and use which columns respectively, and the program will display the chart.  

## 为什么要写这么个东西？Why did you write such a thing?

因为我们想做一些数据相关性的分析，比如一个数据集里，任意两列数据之间有没有相关性等，需要一个灵活好用的散点图工具，但是excel或是很多数据工具的散点图都很难用，不能满足我们的需求，所以我写了这个东西。

Because we wanted to do some data correlation analysis, such as in a dataset, whether there is a correlation between any two columns of data, etc., we need a flexible and easy-to-use scatter plot tool, but the scatter plots in excel or many data tools are very difficult to use and cannot meet our needs, so I wrote this thing.  

## 为什么这么丑？ Why is it so ugly?

因为我不是美工，也不是前端工程师，不很熟悉如何设计一个美观的界面，bootstrap里有什么可以用的东西，我也基本忘记了，所以我就随便弄了一下，先能用就好。

Because I am not a graphic designer, nor a front-end engineer, and I am not very familiar with how to design a beautiful interface. I basically forgot what can be used in bootstrap, so I just did it casually, as long as it can be used first.  

**但是，功能很好用的！不信你试试看。**

**But, the function is very easy to use! try it please.**  

## 程序结构也不优雅啊！The program structure is not elegant either!   

是啊。我有十年没写过程序了，特别是我对JS就一直不很熟，所以一开始没好好规划，实现就好。

然后发现要扩展到不同的图表类型，在不同的文件里写了一堆类似的代码之后，发现可以合并，于是就把遇上的合并了一些，但后来就懒得再弄了。

就算是要合并重用的代码，我也不很懂JS要如何处理这种事情，所以我就用我能想到的办法对付了。

Yeah. I haven't written a program for ten years, especially I have not been very familiar with JS, so I didn't plan well at the beginning, and just implemented it. 

Then I found that it needed to be extended to different chart types. After writing a bunch of similar codes in different files, I found that they could be merged, so I merged some of the ones I met, but then I was too lazy to do it again.  

Even if it is code that needs to be merged and reused, I don't really understand how JS should handle such things, so I just dealt with it in the way I could think of.  

## 如何使用？How to use it?

1. 下载这个仓库
2. 把你的数据源`.csv`文件放入`datas`目录下
3. 双击`run.cmd`，会自动启动一个web服务，在浏览器中打开`http://localhost:8000` （对了，你有安装python3的吧？）

剩下的你应该一看就明白了吧。

1. Download this repository.  
2. Put your data source `.csv` file into the `datas` directory.  
3. Double-click `run.cmd`, and it will automatically start a web service, and open `http://localhost:8000` in the browser (by the way, have you installed python3?).  
The rest you should see at a glance.  


还有几个小技巧：There are a few tips:

- xyz选择栏后面的那个复选框，是表示把这个维度当分类信息，而不是当数值。
- 那个下载按钮，是把当前图表的配置信息保存到localstorege里，方便下次使用。

- The checkbox behind the xyz selection bar indicates to use this dimension as classification information, rather than as a numerical value. 
- That download button saves the configuration information of the current chart to the localstorege for convenient use next time. 

