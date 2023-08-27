## Docker Usage

You can run this script as a Docker container. 

The Docker image is available on [Docker Hub](https://hub.docker.com/r/fletcheralderton/shiori2rss).

### Docker Setup

To run the script as a Docker container:

Pull the Docker image & Set your variables:

   ```sh
    docker run -e API_BASE_URL='<Your Shiori API URL>' -e API_USERNAME='<Your API Username>' -e API_PASSWORD='<Your API Password>' -p 3000:3000 fletcheralderton/shiori2rss
   ```

By default, the Docker container uses port 3000. You can change the local port mapping in the -p flag as needed.
Note

Remember to ensure your Shiori API credentials are provided as environment variables when running the Docker container.
