
# IncidentIQ

### AI-powered production incident investigation

**From incidents to insights. From insights to resolution.**

IncidentIQ helps engineering teams investigate production incidents by
using Google Gemini to coordinate diagnostic tools, correlate available
operational evidence, and produce structured findings and
recommendations.

[Overview](#overview) · [How It Works](#how-it-works) · [Technology
Stack](#technology-stack) · [Run Locally](#run-locally) ·
[Docker](#docker) · [Google Cloud Run](#deploy-to-google-cloud-run)
:::

------------------------------------------------------------------------

## Overview

Production incidents can interrupt critical services, increase
operational costs, and consume engineering time. Investigations often
require engineers to examine information spread across logs, metrics,
databases, deployments, and infrastructure.

**IncidentIQ** is an AI-assisted incident investigation application
built with Java, Spring Boot, Spring AI, and Google Gemini. Gemini acts
as the orchestration and reasoning model: it helps determine which
diagnostic information is needed, coordinates available investigation
tools, correlates the evidence returned by those tools, and generates
investigation findings.

The goal is to reduce repetitive manual investigation, help teams reach
evidence-backed conclusions sooner, and recommend practical next steps.

## Key Capabilities

-   **Incident intake** --- provide a description of a production issue
    to start an investigation.
-   **AI orchestration** --- use Google Gemini through Spring AI to
    guide the investigation and coordinate available diagnostic tools.
-   **Evidence correlation** --- analyze information returned by
    diagnostic tools and relate relevant findings.
-   **Evidence-aware conclusions** --- distinguish observed evidence
    from potential explanations; do not treat an unverified hypothesis
    as a confirmed root cause.
-   **Actionable recommendations** --- generate suggested investigation
    or remediation steps from the available findings.
-   **Investigation report** --- present the issue, analysis, evidence
    and sources, suggestions, status, and similar historical incidents
    where available in the application.
-   **Investigation history** --- review previous investigations through
    the frontend.

> **Important:** Gemini does not automatically have access to production
> systems. The application must provide diagnostic tools and the data
> they are authorized to retrieve. Findings depend on the quality and
> availability of that data.

## How It Works

``` mermaid
flowchart TD
    A[Engineer submits incident] --> B[IncidentIQ backend]
    B --> C[Gemini via Spring AI]
    C --> D[Orchestrate diagnostic tools]
    D --> E[Collect available operational evidence]
    E --> F[Correlate evidence and assess hypotheses]
    F --> G[Generate findings and recommendations]
    G --> H[Investigation report in frontend]
```

1.  **Incident submission** --- an engineer describes the production
    issue in the web interface.
2.  **Orchestration** --- Gemini helps determine what information is
    required and coordinates the diagnostic tools exposed by the
    backend.
3.  **Evidence collection** --- tools return the operational data
    available to the application, such as relevant logs or other
    configured diagnostic information.
4.  **Correlation and analysis** --- Gemini analyzes the returned
    evidence and considers possible explanations without inventing
    missing production data.
5.  **Report generation** --- the application presents the analysis,
    supporting evidence, and suggested next steps.

The model supports the investigation; it does not replace production
telemetry, deterministic checks, or engineering validation.

## Technology Stack

  -----------------------------------------------------------------------
  Area                                Technology
  ----------------------------------- -----------------------------------
  Backend language                    Java 21

  Backend framework                   Spring Boot

  AI integration                      Spring AI

  AI model                            Google Gemini
                                      `gemini-3.5-flash-lite`

  Frontend                            HTML, CSS, JavaScript

  Containerization                    Docker

  Cloud deployment                    Google Cloud Run

  Database                            Configure according to the database
                                      and connection settings in the
                                      project
  -----------------------------------------------------------------------

The exact dependencies and configuration are defined by the repository's
`pom.xml` and application configuration files.

## Application Interface

The frontend is designed around the incident investigation workflow and
includes the following views, as implemented in the application:

-   **Dashboard** --- entry point for the application.
-   **New Investigation** --- submit a production incident for analysis.
-   **Investigation in Progress** --- indicate that the investigation is
    running.
-   **Investigation Report** --- review findings, evidence, suggestions,
    status, and similar historical incidents where available.
-   **History** --- review previous investigations.

The frontend communicates with the Spring Boot backend. Keep the
frontend's configured API paths aligned with the backend controller
mappings.

## Prerequisites

-   Java 21
-   Maven, or the Maven Wrapper if included in the repository
-   A Google Gemini API key
-   Docker, if building or running the container
-   Google Cloud CLI and a Google Cloud project, if deploying to Cloud
    Run

If the application uses a database, configure and start the required
database before running the backend. Use the connection settings and
schema requirements defined by the project; this README does not assume
a database name or credentials.

## Configuration

### Gemini API key

Provide your Gemini API key through the environment variable expected by
the application:

``` bash
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit API keys, database passwords, access tokens, or other
secrets to source control.

### Application and database settings

Review `src/main/resources/application.properties` and any
profile-specific configuration before starting the application. Set the
required database connection details and other application-specific
settings for your environment.

Configuration property names can vary by implementation. Use the names
already defined by the project rather than copying unverified names from
an example.

## Run Locally

1.  Clone the repository:

    ``` bash
    git clone https://github.com/kunal-umap/Incidence-Tracker.git
    cd Incidence-Tracker
    ```

2.  Configure the required environment variables, including
    `GEMINI_API_KEY`, and configure the database if the current
    application requires one.

3.  Build the application:

    ``` bash
    mvn clean package
    ```

4.  Run the generated Spring Boot JAR. Adjust the JAR path if your build
    produces a different filename:

    ``` bash
    java -jar target/<generated-application-jar>.jar
    ```

5.  Open `http://localhost:8080` if the application is configured to use
    port `8080`.

If the repository includes the Maven Wrapper, you can use `./mvnw` on
Linux/macOS or `mvnw.cmd` on Windows instead of installing Maven
separately.

## Run with Docker

The project Dockerfile uses a multi-stage build with Maven and Java 21,
then runs the packaged application on a Java 21 runtime image. The image
is configured for port `8080`.

### Build the image

Run this from the repository root:

``` bash
docker build -t ai-operation-investigator:latest .
```

### Run the container

Pass the Gemini key at runtime rather than baking it into the image:

``` bash
docker run --rm -p 8080:8080 \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  ai-operation-investigator:latest
```

This command illustrates how to pass the Gemini key. If your application
requires database settings or external connectivity, provide those
settings as well. The database must be reachable from the container.

**Logs and files:** The current Docker setup copies
`src/main/resources/logs` into `/app/logs`. If diagnostic tools read log
files from this directory, ensure the expected files are present in the
build context and that the configured paths match the container paths.
Do not package real customer data, credentials, or sensitive production
logs into a public image.

## Deploy to Google Cloud Run

IncidentIQ can be deployed as a containerized service on Google Cloud
Run. The container must listen on the configured Cloud Run port; the
current Dockerfile exposes port `8080`. See the [Cloud Run container
configuration
documentation](https://cloud.google.com/run/docs/configuring/services/containers).

### 1. Build and publish the image

The example below uses Artifact Registry. Replace placeholders with your
actual values and ensure the repository exists.

``` bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud builds submit \
  --tag YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPOSITORY/incidentiq:latest
```

### 2. Deploy the image

``` bash
gcloud run deploy incidentiq \
  --image YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPOSITORY/incidentiq:latest \
  --region YOUR_REGION \
  --port 8080
```

Choose authentication settings appropriate for your application. Add
`--allow-unauthenticated` only if the service is intended to be publicly
accessible.

### 3. Configure secrets and runtime dependencies

-   Supply the Gemini API key securely. For production deployments, use
    [Google Cloud Secret
    Manager](https://cloud.google.com/run/docs/configuring/services/secrets)
    rather than committing secrets or placing them in the Docker image.
-   Configure any required database connection settings and ensure Cloud
    Run can reach the database.
-   Confirm that diagnostic tools can access the data sources they need
    from the deployed environment.
-   Check the Cloud Run logs and application logs after deployment.

**Deployment note:** Cloud Run provides the application runtime; it does
not automatically provision the application's database, production log
sources, metrics systems, or credentials. Those dependencies must be
configured separately.

## Repository Structure

The exact repository tree may evolve. The following describes the main
locations relevant to building and running the application:

``` text
.
├── Dockerfile
├── pom.xml
└── src
    └── main
        ├── java/              # Spring Boot backend and investigation logic
        └── resources/
            ├── application.properties
            ├── static/        # Frontend assets, if stored in the Spring Boot static directory
            └── logs/          # Log files 
```

Treat this as a high-level guide, not a guaranteed exhaustive listing of
every package or file.

## Security and Operational Considerations

-   Keep Gemini API keys and database credentials out of source control
    and container images.
-   Use synthetic or appropriately sanitized data for demonstrations.
-   Grant diagnostic tools only the access required for their purpose.
-   Avoid exposing sensitive log contents in generated reports or
    application logs.
-   Validate AI-generated conclusions against the cited evidence before
    taking production actions.
-   Do not represent a possible root cause as confirmed unless the
    available evidence supports it.
-   Configure access control and authentication before exposing the
    application to users or the public internet.

## Limitations

-   The quality of the investigation depends on the diagnostic tools and
    data sources configured in the application.
-   Missing, stale, or incomplete telemetry can limit the conclusions
    the system can support.
-   AI-generated analysis and recommendations require engineering
    review, especially before production changes.
-   Similar-incident results depend on the historical incident data
    available to the application.

## Contributing

Contributions are welcome. For a change:

1.  Create a branch for your work.
2.  Keep configuration and secrets out of committed files.
3.  Build and test the application using the repository's existing build
    configuration.
4.  Describe the change and any configuration requirements in your pull
    request.



------------------------------------------------------------------------


**IncidentIQ**
AI-assisted investigation. Evidence-led decisions.

