import React from "react"
import "whatwg-fetch"
import jsyaml from "js-yaml"
import marked from "marked"
import Content from "./content"
import highlight from "highlight.js"

marked.setOptions({
  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }
});
let renderer = new marked.Renderer();
let codeTemplate = renderer.code;
renderer.code = function(code, lang) {
  if (lang.indexOf('md-') != -1) {
    return "<div class=\"platform " + lang.replace('md-', '') + "\">" + marked(code) + "</div>";
  } else {
    let rendered = codeTemplate.call(this, code, lang).replace(`lang-${lang}`, 'hljs');
    return "<div class=\"platform " + lang + "\">" + rendered + "</div>";
  }
};

export default class Tutorial extends React.Component {
  
  constructor() {
    super();
    this.state = {
      selectedLesson: null,
      currentMilestone: null,
      selectedChapter: null,
    };
  }
  
  componentWillMount() {
    fetch(this.props.content.url)
      .then(res => {
        return res.text()
      })
      .then(function(res) {
        let spec = jsyaml.load(res);
        let parts = window.location.hash.split('/');
        if (parts.length === 4) {
          this.setState({spec: spec, selectedLesson: parts[2], currentMilestone: parts[3], selectedChapter: parts[1]});
        } else {
          this.setState({spec: spec, selectedLesson: 0, currentMilestone: 0, selectedChapter: 0});
        }
      }.bind(this));
  }

  getChapters() {
    return this.state.spec.chapters;
  }

  getLessonNames(chapter) {
    return chapter.lessons.map(lesson => {
      return lesson.title;
    });
  }

  getMilestoneNames(selectedLesson) {
    console.log(selectedLesson)
    return this.state.spec.chapters[this.state.selectedChapter].lessons[selectedLesson].milestones;
  }
  
  render() {
    console.log(this.props.content)
    if (!this.state.spec) {
      return <div></div>
    } else {
      return (
        <div className="docs-ui">
            <div>
              <div className="drawer">
                {this.getChapters().map((chapter, index) => {
                  return (
                    <div key={index} className="left-nav">
                      <em>{chapter.title}</em>
                      {this.getLessonNames(chapter).map((name, lessonIndex) => {
                        return (
                          <a
                            style={this.state.selectedLesson == lessonIndex && this.state.selectedChapter == index ? {backgroundColor: '#e0e0e0'} : {}}
                            key={lessonIndex}
                            className="toc-item instructions"
                            href={`#/${this.state.selectedChapter}/${this.state.selectedLesson}/${this.state.currentMilestone}`}
                            onClick={(e) => {this.setState({selectedChapter: index, selectedLesson: lessonIndex, currentMilestone: 0})}}>
                            <i>{lessonIndex + 1}</i>
                            <span>{name}</span>
                          </a>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <div className="body">
                <div className="main">
                  <div className={`display-platform-${this.state.platform}`}>
                    <div className="toggler">
                      <div id="platform-tabs" >
                        {/*<span>Platform:</span>*/}
                        {/*{this.state.platforms.map((name, index) => {*/}
                        {/*return (*/}
                        {/*<Link className={`button-${name}`} to={`${name}`}>*/}
                        {/*{name}*/}
                        {/*</Link>*/}
                        {/*)*/}
                        {/*})}*/}
                      </div>
                    </div>
                  </div>
                  <nav className="milestones">
                    <ol>
                      {this.getMilestoneNames(this.state.selectedLesson).map((milestone, index) => {
                        return (
                          <li
                            key={index}
                            style={this.state.currentMilestone == index ? {backgroundColor: '#e0e0e0'} : {}}>
                            <a
                              className="instructions"
                              href={`#/${this.state.selectedChapter}/${this.state.selectedLesson}/${this.state.currentMilestone}`}
                              onClick={(e) => {this.setState({currentMilestone: index})}}>
                              {milestone.title}
                            </a>
                          </li>
                        )
                      })}
                    </ol>
                  </nav>
                  <div className="inner">
                    <div>
                      <div>
                        <Content
                          tryitout={this.state.spec.chapters[this.state.selectedChapter].lessons[this.state.selectedLesson].milestones[this.state.currentMilestone].tryitout}
                          platform={this.state.platform}
                          passPlatform={(platform) => {this.setState({platform: platform})}}
                          description={marked(this.state.spec.chapters[this.state.selectedChapter].lessons[this.state.selectedLesson].milestones[this.state.currentMilestone].description, {renderer: renderer})}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )
    }
  }
}