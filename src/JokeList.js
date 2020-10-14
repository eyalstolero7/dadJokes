import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
import { v4 as uuid } from "uuid";

class JokeList extends Component {
  static defaultProps = {
    numJukesToGet: 10
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((st) => ({ loading: true }), this.getJokes);
  }

  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJukesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke.text)) {
          jokes.push({ text: newJoke, votes: 0, id: uuid() });
          this.seenJokes.add(newJoke.text);
        }
      }
      this.setState(
        (st) => ({ jokes: [...st.jokes, ...jokes], loading: false }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
    }
  }

  async componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="emoji"
          ></img>
          <button className="JokeList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map((j) => (
            <div>
              <Joke
                votes={j.votes}
                text={j.text}
                id={j.id}
                key={j.id}
                upvote={() => this.handleVote(j.id, 1)}
                downvote={() => this.handleVote(j.id, -1)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default JokeList;
