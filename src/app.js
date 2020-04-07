const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

/**
 * Validates the resource exists with the given id
 *
 * Immediately returns an error if it doesn't otherwise it moves
 * to the next middleware exposing the resource object and its index
 * to response.locals for convenience
 *
 */

function validRepositoryId(request, response, next) {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(repo => repo.id === id);

  if (repositoryIndex < 0) return response.status(400).json({
    error: `The resource does not exist.`
  });

  response.locals = {
    ...response.locals,
    repository: repositories[repositoryIndex],
    repositoryIndex
  };

  next();
}

app.use('/repositories/:id', validRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { url, title, techs } = request.body;

  const repository = {
    id: uuid(),
    url,
    title,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { url, title, techs } = request.body;
  const { id } = request.params;
  const { repository, repositoryIndex } = response.locals;

  const updatedRepository = {
    id,
    url,
    title,
    techs,
    likes: repository.likes
  };

  repositories[repositoryIndex] = updatedRepository;
  return response.json(updatedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = response.locals;

  repositories.splice(repositoryIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repository } = response.locals;

  repository.likes++;
  return response.json(repository);
});

module.exports = app;
