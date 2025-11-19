# Docker & Container Deployment Guide

## Local Development with Docker Compose

### Build the image
```bash
docker-compose build
```

### Run locally
```bash
docker-compose up
```

The service will be available at `http://localhost:3000`

### Stop the service
```bash
docker-compose down
```

---

## AWS ECS Deployment

### Prerequisites
- AWS CLI configured
- ECR repository created
- ECS cluster running
- Load balancer (optional but recommended)

### 1. Build and Push to ECR

```bash
# Get login token for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t secure-code-bot:latest .

# Tag for ECR
docker tag secure-code-bot:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secure-code-bot:latest

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secure-code-bot:latest
```

### 2. Create ECS Task Definition

Update `ecs-task-definition.json` with your AWS Account ID, then:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 3. Create ECS Service

```bash
aws ecs create-service \
  --cluster your-cluster-name \
  --service-name secure-code-bot \
  --task-definition secure-code-bot:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=secure-code-bot,containerPort=3000
```

### 4. Update Service (for new deployments)

```bash
aws ecs update-service \
  --cluster your-cluster-name \
  --service secure-code-bot \
  --force-new-deployment
```

---

## Environment Variables

Create a `.env` file or store in AWS Secrets Manager:

```
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/webhookb2/...
TEAMS_CHANNEL_ID=your-channel-id
CYCODEAPI_URL=https://api.cycode.com
CYCODEAPI_TOKEN=your-token
NODE_ENV=production
PORT=3000
```

---

## Kubernetes Deployment (Alternative)

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-code-bot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: secure-code-bot
  template:
    metadata:
      labels:
        app: secure-code-bot
    spec:
      containers:
      - name: secure-code-bot
        image: YOUR_REGISTRY/secure-code-bot:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - configMapRef:
            name: secure-code-bot-config
        - secretRef:
            name: secure-code-bot-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: secure-code-bot
spec:
  selector:
    app: secure-code-bot
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## SecureCodeBox Integration

To integrate this as a webhook within SecureCodeBox:

1. Deploy this service to your infrastructure
2. Configure the webhook URL in SecureCodeBox:
   ```
   https://your-domain/webhooks/securecodebox
   ```
3. SecureCodeBox will POST scan results to this endpoint
4. The bot will process and post to Microsoft Teams

---

## Monitoring & Logs

### Docker Compose
```bash
docker-compose logs -f secure-code-bot
```

### ECS
```bash
aws logs tail /ecs/secure-code-bot --follow
```

### Health Check
```bash
curl http://localhost:3000/health
```
