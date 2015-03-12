import { repos as RepoFixtures } from '../fixtures';

export default function() {

  this.get('api.github.com/user/repos', function(req) {
    return [
      200,
      {},
      JSON.stringify(RepoFixtures)
    ];
  });

}

